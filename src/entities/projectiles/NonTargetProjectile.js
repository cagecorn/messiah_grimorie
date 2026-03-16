import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import projectileManager from '../../systems/combat/ProjectileManager.js';
import combatManager from '../../systems/CombatManager.js';
import instanceIDManager from '../../utils/InstanceIDManager.js';
import layerManager from '../../ui/LayerManager.js';

/**
 * 논타겟 투사체 베이스 (Non-Target Projectile Base)
 * 역할: [지점 타겟팅 및 스킬샷 기능이 있는 투사체의 공통 로직 관리]
 */
export default class NonTargetProjectile extends Phaser.GameObjects.Container {
    constructor(scene, x, y, texture) {
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

        // 메인 스프라이트 생성 (컨테이너 기반)
        if (texture) {
            this.mainSprite = scene.add.sprite(0, 0, texture);
            this.add(this.mainSprite);
        }

        scene.add.existing(this);
    }

    /**
     * 스프라이트 관련 대리자 메서드 (Proxy methods)
     */
    setFlipX(value) {
        if (this.mainSprite) this.mainSprite.setFlipX(value);
        return this;
    }

    setFrame(frame) {
        if (this.mainSprite) this.mainSprite.setFrame(frame);
        return this;
    }

    setOrigin(x, y) {
        if (this.mainSprite) this.mainSprite.setOrigin(x, y);
        return this;
    }

    /**
     * 발사 초기화
     */
    launch(owner, target, config = {}) {
        this.owner = owner;
        this.damageMultiplier = config.damageMultiplier || 1.0;
        this.speed = config.speed || 400;
        this.damageType = config.damageType || 'magic';
        this.isPierce = config.isPierce || false;
        this.hitTargets.clear();
        this.collisionRadius = config.collisionRadius || 40;
        
        this.id = instanceIDManager.generate(`proj_nontarget_${owner.id}`);

        // 타겟 위치 설정 (엔티티가 들어오면 좌표만 따옴)
        if (target && target.x !== undefined) {
            this.targetPos = { x: target.x, y: target.y };
        } else if (config.targetPos) {
            this.targetPos = { x: config.targetPos.x, y: config.targetPos.y };
        }

        // 발사 위치 설정
        this.setPosition(owner.x, owner.y - 40);
        
        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(1);
        layerManager.assignToLayer(this, 'fx');

        // 물리 엔진 사용 여부 (관통형은 주로 물리 이동 활용)
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

        // 1. 이동 로직 (기본은 지점으로 이동)
        if (moveDist >= dist && !this.isPierce) {
            this.setPosition(this.targetPos.x, this.targetPos.y);
            this.hitGround();
        } else {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
            this.x += Math.cos(angle) * moveDist;
            this.y += Math.sin(angle) * moveDist;

            // 방향 업데이트
            this.updateRotation(angle, this.targetPos.x > this.x);

            // 2. 경로상 충돌 체크 (근접 즉시 폭발 로직)
            this.checkCollisions();
        }

        this.onUpdate(time, delta);
    }

    updateRotation(angle, isFacingRight) {
        if (isFacingRight) {
            this.setFlipX(true);
            this.setRotation(angle);
        } else {
            this.setFlipX(false);
            this.setRotation(angle + Math.PI);
        }
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

    /**
     * 유닛과 부딪혔을 때
     */
    hit(target) {
        if (this.hitTargets.has(target.id)) return;
        this.hitTargets.add(target.id);

        combatManager.processDamage(this.owner, target, {
            multiplier: this.damageMultiplier,
            projectileId: this.id
        }, this.damageType);

        this.onHit(target);

        // 관통이 아니면 폭발 후 소멸
        if (!this.isPierce) {
            this.explode();
        }
    }

    /**
     * 목표 지점에 도달했을 때 (적을 못 맞췄거나 지점 타겟인 경우)
     */
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
