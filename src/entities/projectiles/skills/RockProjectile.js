import Phaser from 'phaser';
import TargetProjectile from '../TargetProjectile.js';
import animationManager from '../../../systems/graphics/AnimationManager.js';

/**
 * 바위 투사체 (Rock Projectile)
 * 역할: [바오 전용 염력 바위 투사체]
 * 특성: 
 * 1. 일반 공격: 타겟 추적형 바위.
 * 2. 스킬/궁극기: 낙하형 AOE 바위 (TargetProjectile의 다형성 활용).
 */
export default class RockProjectile extends TargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'rock_projectile'); 
        
        this.setScale(1.0);
        this.damageType = 'magic';
    }

    onLaunch(config) {
        this.speed = config.speed || 800;
        this.radius = config.radius || 40; 
        this.isUltimate = config.isUltimate || false;
        
        const baseScale = config.scale || 1.0;
        this.setScale(baseScale);

        // 초기 방향 설정
        this.updateDirection();
    }

    onUpdate(time, delta) {
        // 타겟 방향으로 회전 업데이트
        this.updateDirection();
    }

    /**
     * 타겟(또는 속도) 방향에 따른 각도 및 반전 보정
     */
    updateDirection() {
        if (!this.body) return;

        // 진행 방향의 각도 계산
        const velocity = this.body.velocity;
        if (velocity.x === 0 && velocity.y === 0) return;

        const angle = Math.atan2(velocity.y, velocity.x);
        
        // 원본 이미지가 왼쪽(-1, 0)을 보고 있으므로, 180도(PI) 오프셋 추가
        this.rotation = angle + Math.PI;
    }

    onHit(target) {
        // [시각 효과] 전용 석벽 폭발 연출
        animationManager.playStoneExplosion(this.x, this.y);

        // 광역 피해 처리 (radius가 설정된 경우)
        if (this.radius > 50) {
            this.explode();
        }

        if (this.scene.sound) {
            this.scene.sound.play('physical_hit_1', { volume: 0.6 });
        }
    }

    /**
     * 폭발(광역) 처리
     */
    explode() {
        const targets = this.scene.combatManager.getUnitsInRange(this.x, this.y, this.radius);
        
        targets.forEach(unit => {
            if (unit.active && unit.team !== this.owner.team) {
                this.scene.combatManager.processDamage(this.owner, unit, {
                    multiplier: this.damageMultiplier,
                    projectileId: 'rock_aoe'
                }, 'magic', this.isUltimate);
            }
        });

        // 지면 충격 연출
        if (this.scene.cameras.main) {
            this.scene.cameras.main.shake(150, 0.005);
        }
    }
}
