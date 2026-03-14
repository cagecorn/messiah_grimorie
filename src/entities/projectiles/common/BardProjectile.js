import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import projectileManager from '../../../systems/combat/ProjectileManager.js';
import combatManager from '../../../systems/CombatManager.js';
import instanceIDManager from '../../../utils/InstanceIDManager.js';

/**
 * 바드 음표 투사체 (Bard Projectile)
 * 역할: [타겟 추적 및 직선/곡선 비행 로직]
 * 자산 특징: 항상 왼쪽을 바라보고 있음.
 */
export default class BardProjectile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bard_projectile_effect');
        
        this.owner = null;
        this.target = null;
        this.damageMultiplier = 1.0;
        this.speed = 450;
        this.elapsedTime = 0;
        this.duration = 0;
        this.startX = 0;
        this.startY = 0;
        
        this.setOrigin(0.5, 0.5);
        this.id = "";
    }

    launch(owner, target, config = {}) {
        this.owner = owner;
        this.target = target;
        this.damageMultiplier = config.damageMultiplier || 1.0;
        this.speed = config.speed || 450;
        
        this.id = instanceIDManager.generate(`proj_bard_${owner.id}`);

        this.setX(owner.x);
        this.setY(owner.y - 40);
        this.startX = this.x;
        this.startY = this.y;
        
        this.setActive(true);
        this.setVisible(true);
        this.elapsedTime = 0;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        this.duration = (dist / this.speed) * 1000;

        // [USER 요청] 방향 조절
        // 이 자산은 기본적으로 왼쪽을 보고 있음.
        this.updateRotation(target.x - this.x, target.y - this.y);
    }

    update(time, delta) {
        if (!this.active || !this.target) return;

        this.elapsedTime += delta;
        const t = Math.min(1.0, this.elapsedTime / this.duration);

        const targetX = this.target.x;
        const targetY = this.target.y - 40;

        const nextX = Phaser.Math.Interpolation.Linear([this.startX, targetX], t);
        const nextY = Phaser.Math.Interpolation.Linear([this.startY, targetY], t);

        // 방향 업데이트 및 회전
        const dx = nextX - this.x;
        const dy = nextY - this.y;
        if (dx !== 0 || dy !== 0) {
            this.updateRotation(dx, dy);
        }

        this.setPosition(nextX, nextY);

        if (t >= 1.0) {
            this.hit();
        }
    }

    updateRotation(dx, dy) {
        const angle = Math.atan2(dy, dx);
        
        // [USER 요청] 항상 왼쪽을 바라보는 이미지 처리
        // 타겟이 오른쪽에 있으면 (dx > 0)
        if (dx > 0) {
            this.setFlipX(true); // 오른쪽을 보게 반전
            this.setRotation(angle); // 0도(오른쪽) 기준 회전
        } else {
            this.setFlipX(false); // 원래 왼쪽
            this.setRotation(angle + Math.PI); // PI(왼쪽) 기준 회전
        }
    }

    hit() {
        if (this.target && this.target.logic.isAlive) {
            combatManager.processDamage(this.owner, this.target, {
                multiplier: this.damageMultiplier,
                projectileId: this.id
            }, 'magic'); // 바드는 마법 데미지
        }
        this.destroyProjectile();
    }

    destroyProjectile() {
        projectileManager.release(this);
    }
}
