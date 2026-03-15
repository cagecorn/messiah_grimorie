import Phaser from 'phaser';
import TargetProjectile from '../TargetProjectile.js';
import combatManager from '../../../systems/CombatManager.js';
import instanceIDManager from '../../../utils/InstanceIDManager.js';

/**
 * 화살 투사체 (Arrow Projectile)
 * 역할: [타겟 추적 및 포물선 비행 로직]
 * 특성: 타겟(Target) - 적을 끝까지 추격함.
 */
export default class ArrowProjectile extends TargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'arrow_projectile');
        
        this.peakHeight = 80; // 포물선 정점 높이
    }

    onLaunch(config) {
        this.peakHeight = config.peakHeight || 80;
        
        // 거리 기반 포물선 높이 조절
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        this.peakHeight = Math.min(150, dist * 0.3);
        
        this.id = instanceIDManager.generate(`proj_arrow_${this.owner.id}`);
        this.setScale(0.5);
    }

    /**
     * 포물선 연출을 위해 update 오버라이드
     */
    update(time, delta) {
        if (!this.active || !this.target || !this.target.active) {
            if (this.active) this.destroyProjectile();
            return;
        }

        this.elapsedTime += delta;
        const t = Math.min(1.0, this.elapsedTime / this.duration);

        // 1. 선형 보간 (Base XY - 실시간 타겟 추적)
        const targetX = this.target.x;
        const targetY = this.target.y - 40;

        const currentX = Phaser.Math.Interpolation.Linear([this.startX, targetX], t);
        const currentY = Phaser.Math.Interpolation.Linear([this.startY, targetY], t);

        // 2. 포물선 오프셋 적용
        const parabolaOffset = 4 * this.peakHeight * t * (1 - t);
        
        const nextX = currentX;
        const nextY = currentY - parabolaOffset;

        // 3. 방향 및 회전 (진행 방향 바라보기)
        const dx = nextX - this.x;
        const dy = nextY - this.y;
        const angle = Math.atan2(dy, dx);
        
        this.updateRotation(angle, this.target.x > this.owner.x);

        // [USER 요청] 궤도에 맞게 Squash & Stretch 적용
        const distToPrev = Math.sqrt(dx * dx + dy * dy);
        const stretch = 1.0 + Math.min(0.5, distToPrev / 20);
        const squash = 1.0 / stretch;
        this.setScale(stretch * 0.5, squash * 0.5);

        this.setPosition(nextX, nextY);

        // 4. 도착 판정 (t 기반)
        if (t >= 1.0) {
            this.hit();
        }
    }
}
