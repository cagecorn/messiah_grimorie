import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import projectileManager from '../../systems/combat/ProjectileManager.js';
import combatManager from '../../systems/CombatManager.js';
import instanceIDManager from '../../utils/InstanceIDManager.js';
import layerManager from '../../ui/LayerManager.js';

/**
 * 논타겟 텍스트 투사체 베이스 (Non-Target Text Projectile Base)
 * 역할: [이모지나 텍스트를 발사하는 유도되지 않는 투사체의 공통 로직 관리]
 */
export default class NonTargetProjectileText extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text, style) {
        super(scene, x, y);
        
        this.owner = null;
        this.targetPos = { x: 0, y: 0 };
        this.damageMultiplier = 1.0;
        this.speed = 400;
        this.id = "";
        this.damageType = 'magic';
        this.isPierce = false;
        this.hitTargets = new Set();
        this.collisionRadius = 40;

        // 메인 텍스트 생성 (컨테이너 기반)
        this.mainText = scene.add.text(0, 0, text, style || { 
            fontSize: '48px', 
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.mainText.setOrigin(0.5, 0.5);
        this.add(this.mainText);

        scene.add.existing(this);
    }

    /**
     * 텍스트 관련 대리자 메서드 (Proxy methods)
     */
    setText(value) {
        if (this.mainText) this.mainText.setText(value);
        return this;
    }

    setOrigin(x, y) {
        if (this.mainText) this.mainText.setOrigin(x, y);
        return this;
    }

    setColor(color) {
        if (this.mainText) this.mainText.setColor(color);
        return this;
    }

    launch(owner, target, config = {}) {
        this.owner = owner;
        this.damageMultiplier = config.damageMultiplier || 1.0;
        this.speed = config.speed || 400;
        this.damageType = config.damageType || 'magic';
        this.isPierce = config.isPierce || false;
        this.hitTargets.clear();
        this.collisionRadius = config.collisionRadius || 40;
        
        this.id = instanceIDManager.generate(`proj_text_${owner.id}`);

        if (target && target.x !== undefined) {
            this.targetPos = { x: target.x, y: target.y };
        } else if (config.targetPos) {
            this.targetPos = { x: config.targetPos.x, y: config.targetPos.y };
        }

        this.setPosition(owner.x, owner.y - 40);
        
        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(1);
        layerManager.assignToLayer(this, 'fx');

        if (config.usePhysics && !this.body) {
            this.scene.physics.add.existing(this);
        }

        this.onLaunch(config);
    }

    onLaunch(config) {}

    update(time, delta) {
        if (!this.active) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
        const moveDist = (this.speed * delta) / 1000;

        if (moveDist >= dist && !this.isPierce) {
            this.setPosition(this.targetPos.x, this.targetPos.y);
            this.hitGround();
        } else {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
            // 만약 물리 엔진을 쓰고 있다면 launch에서 속도를 줬을 것임. 
            // 여기서는 수동 이동 로직을 유지하거나 body 체크
            if (!this.body || !this.body.enable) {
                this.x += Math.cos(angle) * moveDist;
                this.y += Math.sin(angle) * moveDist;
            }

            this.checkCollisions();
        }

        this.onUpdate(time, delta);
    }

    checkCollisions() {
        const enemies = (this.owner.team === 'mercenary') ? this.scene.enemies : this.scene.allies;
        if (!enemies) return;

        enemies.forEach(enemy => {
            if (!enemy.active || !enemy.logic.isAlive) return;
            if (this.hitTargets.has(enemy.id)) return;

            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y - 40);
            if (dist < this.collisionRadius) {
                this.hit(enemy);
            }
        });
    }

    onUpdate(time, delta) {}

    hit(target) {
        if (this.hitTargets.has(target.id)) return;
        this.hitTargets.add(target.id);

        combatManager.processDamage(this.owner, target, {
            multiplier: this.damageMultiplier,
            projectileId: this.id
        }, this.damageType);

        this.onHit(target);

        if (!this.isPierce) {
            this.explode();
        }
    }

    hitGround() {
        this.onHitGround();
        this.explode();
    }

    onHit(target) {}
    onHitGround() {}

    explode() {
        this.destroyProjectile();
    }

    destroyProjectile() {
        if (this.body) this.body.setEnable(false);
        projectileManager.release(this);
    }
}
