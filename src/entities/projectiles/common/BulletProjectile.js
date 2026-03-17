import Phaser from 'phaser';
import TargetProjectile from '../TargetProjectile.js';
import fxManager from '../../../systems/graphics/FXManager.js';

/**
 * 불렛 투사체 (Bullet Projectile)
 * 역할: [빠르고 직선적인 원거리 공격]
 * 특성: 타겟(Target) - 적을 향해 직선으로 빠르게 날아감.
 */
export default class BulletProjectile extends TargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet_projectile');
        this.damageType = 'physical';
    }

    onLaunch(config) {
        // 기존 화살보다 훨씬 빠른 속도
        this.speed = config.speed || 800;
        this.setScale(0.8);
    }

    /**
     * 적중 시 효과 커스텀
     */
    onHit(target) {
        // [FIX] 전용 FX 매니저를 통해 피격 이펙트 재생
        fxManager.showImpactEffect(target, 'impact_effect');
    }
}
