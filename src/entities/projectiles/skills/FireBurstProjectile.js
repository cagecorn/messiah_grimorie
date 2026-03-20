import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import combatManager from '../../../systems/CombatManager.js';
import fxManager from '../../../systems/graphics/FXManager.js';
import Logger from '../../../utils/Logger.js';

/**
 * 파이어 버스트 투사체 (FireBurstProjectile)
 * 역할: [광역 화염 공격 투사체]
 * 특성: 논타겟(Non-Target) - 목표 지점으로 날아가며 경로상의 적이나 지점에 닿으면 폭발.
 */
export default class FireBurstProjectile extends NonTargetProjectile {
    constructor(scene) {
        super(scene, 0, 0, 'fire_burst_projectile');
        
        // 화염구 느낌을 위해 발광 연출 (선택)
        this.setBlendMode(Phaser.BlendModes.ADD);
    }

    onLaunch(config) {
        this.config = config;
        this.speed = config.speed || 600;
        this.collisionRadius = 40; 
        this.damageType = 'magic';
        
        // [Standardized AOE]
        this.aoeRadius = config.aoeRadius || 150;
        this.aoeMultiplier = config.damageMultiplier || 1.0;
        this.attribute = config.attribute || 'fire';

        this.setAlpha(1);
        this.setScale(1.2);
    }

    /**
     * 유닛이나 지점에 명중했을 때 호출됨 (Base class에서 제어)
     */
    onHit(target) {
        // 비주얼 효과만 처리 (데미지는 explode -> base.explode에서 처리)
        fxManager.showFireExplosion(this.x, this.y);
    }

    onHitGround() {
        fxManager.showFireExplosion(this.x, this.y);
    }

    explode() {
        Logger.info("FIRE_BURST", `Fire Burst exploded at (${Math.round(this.x)}, ${Math.round(this.y)})`);
        super.explode();
    }
}
