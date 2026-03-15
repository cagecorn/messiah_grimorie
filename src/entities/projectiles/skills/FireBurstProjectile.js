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
        this.speed = config.speed || 600; // 아쿠아버스트보다 조금 빠름
        this.collisionRadius = 40; 
        this.damageType = 'magic';

        this.setAlpha(1);
        this.setScale(1.2);
    }

    /**
     * 유닛이나 지점에 명중했을 때 호출됨 (Base class에서 제어)
     */
    onHit(target) {
        this.triggerExplosion();
    }

    onHitGround() {
        this.triggerExplosion();
    }

    triggerExplosion() {
        // [시각 효과] 파이어 폭발 (풀링 사용)
        fxManager.showFireExplosion(this.x, this.y);

        // [광역 데미지]
        const radius = 150; // 아쿠아버스트(120)보다 넓음
        const damageMult = this.damageMultiplier;

        const unitsInScene = Array.from(combatManager.units);
        
        Logger.info("FIRE_BURST", `Fire Burst exploded at (${Math.round(this.x)}, ${Math.round(this.y)})`);

        unitsInScene.forEach(unit => {
            if (unit.active && unit.logic && unit.logic.isAlive) {
                if (unit.team !== this.owner.team) {
                    const dist = Phaser.Math.Distance.Between(this.x, this.y, unit.x, unit.y - 40);
                    if (dist <= radius) {
                        // 데미지 처리
                        combatManager.processDamage(this.owner, unit, {
                            multiplier: damageMult,
                            projectileId: this.id
                        }, 'magic');
                    }
                }
            }
        });
    }
}
