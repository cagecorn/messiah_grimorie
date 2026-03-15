import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import projectileManager from '../../systems/combat/ProjectileManager.js';
import combatManager from '../../systems/CombatManager.js';
import instanceIDManager from '../../utils/InstanceIDManager.js';
import layerManager from '../../ui/LayerManager.js';

/**
 * 타겟 투사체 컨테이너 베이스 (Target Projectile Container Base)
 * 역할: [여러 스프라이트를 포함하는 유도 투사체의 공통 로직 관리]
 */
export default class TargetProjectileContainer extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        
        this.owner = null;
        this.target = null;
        this.damageMultiplier = 1.0;
        this.speed = 500;
        this.id = "";
        this.damageType = 'magic';

        this.elapsedTime = 0;
        this.duration = 0;
        this.startX = 0;
        this.startY = 0;
        
        scene.add.existing(this);
    }

    launch(owner, target, config = {}) {
        this.owner = owner;
        this.target = target;
        this.damageMultiplier = config.damageMultiplier || 1.0;
        this.speed = config.speed || 500;
        this.damageType = config.damageType || 'magic';
        
        this.id = instanceIDManager.generate(`proj_target_cont_${owner.id}`);

        this.setPosition(owner.x, owner.y - 40);
        this.startX = this.x;
        this.startY = this.y;
        
        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(1);
        layerManager.assignToLayer(this, 'fx');
        this.elapsedTime = 0;

        if (this.target) {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            this.duration = (dist / this.speed) * 1000;
        }

        this.onLaunch(config);
    }

    onLaunch(config) {}

    update(time, delta) {
        if (!this.active || !this.target || !this.target.active) {
            if (this.active) this.destroyProjectile();
            return;
        }

        this.elapsedTime += delta;
        const targetX = this.target.x;
        const targetY = this.target.y - 40;

        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);

        const moveDist = (this.speed * delta) / 1000;

        if (moveDist >= dist) {
            this.setPosition(targetX, targetY);
            this.hit();
        } else {
            this.x += Math.cos(angle) * moveDist;
            this.y += Math.sin(angle) * moveDist;

            // 방향 업데이트
            this.updateRotation(angle, targetX > this.x);
        }

        this.onUpdate(time, delta);
    }

    updateRotation(angle, isFacingRight) {
        if (isFacingRight) {
            this.setScale(1, 1);
            this.iterate(child => {
                if (child.setFlipX) child.setFlipX(true);
                if (child.setRotation) child.setRotation(angle);
            });
        } else {
            this.setScale(1, 1);
            this.iterate(child => {
                if (child.setFlipX) child.setFlipX(false);
                if (child.setRotation) child.setRotation(angle + Math.PI);
            });
        }
    }

    onUpdate(time, delta) {}

    hit() {
        if (this.target && this.target.logic && this.target.logic.isAlive) {
            combatManager.processDamage(this.owner, this.target, {
                multiplier: this.damageMultiplier,
                projectileId: this.id
            }, this.damageType);
            this.onHit(this.target);
        }
        this.destroyProjectile();
    }

    onHit(target) {}

    destroyProjectile() {
        projectileManager.release(this);
    }
}
