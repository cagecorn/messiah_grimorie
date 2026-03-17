import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import Slow from '../../../systems/combat/effects/Slow.js';
import fxManager from '../../../systems/graphics/FXManager.js';

/**
 * 토네이도 샷 투사체 (Tornado Shot Projectile)
 * 역할: [모든 적을 관통하며 슬로우 효과 부여]
 * 특성: 논타겟(Non-Target) - 직선 관통 비행.
 */
export default class TornadoShotProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'tornado_shot_projectile');
        this.damageType = 'physical';
        this.isPierce = true; // [REQ] 직선 관통
    }

    onLaunch(config) {
        this.speed = config.speed || 600;
        this.damageMultiplier = config.damageMultiplier || 1.5; // [REQ] 물리 계수 1.5
        this.setScale(1.2);
    }

    /**
     * 유닛 관통 시 효과
     */
    onHit(target) {
        // [REQ] 적중 시 슬로우 적용
        Slow.apply(target, 3000); // 3초간 슬로우

        // [FIX] 전용 FX 매니저를 통해 피격 이펙트 재생
        fxManager.showImpactEffect(target, 'impact_effect');
    }

    /**
     * 논타겟 투사체는 update에서 checkCollisions를 호출함.
     * 관통형이므로 화면 끝까지 날아가도록 하기 위해 targetPos를 멀리 잡는 것이 좋음.
     */
}
