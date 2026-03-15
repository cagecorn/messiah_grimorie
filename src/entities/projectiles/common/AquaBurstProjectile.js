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
        this.config = config; // { isSleeping: false, damageMultiplier: 1.5 }
        this.speed = config.speed || 400;
        this.collisionRadius = 30; // 버블 크기에 맞게 조정
        this.damageType = 'magic';

        // 화려한 연출을 위해 초기 비주얼 설정 (필요시)
        this.setAlpha(1);
        this.setScale(1.0);
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
        // [시각 효과] 아쿠아 폭발
        if (fxManager.showAquaExplosion) {
            fxManager.showAquaExplosion(this.x, this.y);
        }

        // [광역 데미지]
        const radius = 120; // 80 -> 120 (상향)
        const damageMult = this.damageMultiplier;
        const isSleeping = this.config.isSleeping || false;

        const unitsInScene = Array.from(combatManager.units);
        
        // [AQUA_SIREN] 태그를 사용하여 전투 로그 기록 (사용자 요청)
        Logger.info("AQUA_SIREN", `Aqua Burst exploded at (${Math.round(this.x)}, ${Math.round(this.y)})`);

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
                        
                        // 수면 효과 (Sleeping Bubble일 때만)
                        if (isSleeping && unit.logic.status) {
                            unit.logic.status.applyEffect('sleep', 4000); // 4초 수면
                        }
                    }
                }
            }
        });
    }
}
