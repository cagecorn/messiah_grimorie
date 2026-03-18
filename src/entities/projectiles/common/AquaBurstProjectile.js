import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import combatManager from '../../../systems/CombatManager.js';
import fxManager from '../../../systems/graphics/FXManager.js';
import Logger from '../../../utils/Logger.js';

/**
 * 아쿠아 버스트 투사체 (AquaBurstProjectile)
 * 역할: [세이렌의 스킬 투사체. 명중 시 광역 데미지 발생]
 * 특성: 논타겟(Non-Target) - 목표 지점으로 날아가며 경로상의 적이나 지점에 닿으면 폭발.
 */
export default class AquaBurstProjectile extends NonTargetProjectile {
    constructor(scene) {
        super(scene, 0, 0, 'aqua_burst_projectile');
        
        // 원본 이미지가 왼쪽을 보고 있으므로 초기 회전값 보정 가능
        // (Base class에서 방향에 따라 처리함)
    }

    onLaunch(config) {
        this.config = config;
        this.speed = config.speed || 400;
        this.collisionRadius = 30;
        this.damageType = 'magic';
        
        // [Standardized AOE]
        this.aoeRadius = config.aoeRadius || 120;
        this.aoeMultiplier = config.damageMultiplier || 1.0;

        this.setAlpha(1);
        this.setScale(1.0);
    }

    onHit(target) {
        // 이펙트는 explode에서 일괄 처리 (아쿠아버스트는 웅덩이 폭발이 메인이므로)
    }

    onHitGround() {}

    explode() {
        // [시각 효과] 아쿠아 폭발
        if (fxManager.showAquaExplosion) {
            fxManager.showAquaExplosion(this.x, this.y);
        }

        Logger.info("AQUA_SIREN", `Aqua Burst exploded at (${Math.round(this.x)}, ${Math.round(this.y)})`);

        // 특수 효과 (수면) 처리를 위한 콜백 정의
        const isSleeping = this.config.isSleeping || false;
        const onHitCallback = (hitTarget) => {
            if (isSleeping && hitTarget.logic && hitTarget.logic.status) {
                hitTarget.logic.status.applyEffect('sleep', 4000);
            }
        };

        // 베이스 클래스의 explode가 aoeManager를 호출할 때 콜백을 전달하게 하려면 
        // 베이스 클래스의 invoke AOE를 조금 더 유연하게 하거나, 여기서 직접 호출하고 radius를 0으로 일시 설정해야 함.
        // 하지만 베이스 클래스에 이미 onImpact 등의 메커니즘이 있으므로...
        // 그냥 직접 aoeManager를 부르고 super.explode() 전달 시 radius를 0으로 하면 됨.
        
        aoeManager.applyAOEDamagingEffect(
            this.owner,
            this.x,
            this.y,
            this.aoeRadius,
            this.aoeMultiplier,
            this.damageType,
            onHitCallback
        );

        const oldRadius = this.aoeRadius;
        this.aoeRadius = 0; // 중복 방지
        super.explode();
        this.aoeRadius = oldRadius;
    }
}
