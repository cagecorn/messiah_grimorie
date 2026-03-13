import Logger from '../utils/Logger.js';
import { COMBAT } from '../core/TechnicalConstants.js';
import TimeManager from '../core/TimeManager.js';
import measurementManager from '../core/MeasurementManager.js';
import soundManager from './SoundManager.js';
import damageCalculationManager from './combat/DamageCalculationManager.js';
import projectileManager from './combat/ProjectileManager.js';
import ArrowProjectile from '../entities/projectiles/common/ArrowProjectile.js';
import fxManager from './graphics/FXManager.js';

/**
 * 컴뱃 매니저 (Combat Manager)
 * 역할: [전투 로직의 중앙 라우터]
 * 
 * 설명: 1000마리 이상의 유닛이 참여하는 대규모 전투를 처리하기 위한 연산 허브입니다.
 */
class CombatManager {
    constructor() {
        this.units = new Set(); // 현재 전장에 존재하는 모든 유닛 (용병+몬스터)
        this.grid = null;       // 공간 분할 격자 (Spatial Partitioning Grid)
        
        Logger.system("CombatManager: Initialized (Large-scale optimization ready).");
    }

    /**
     * 전투 업데이트 루프
     */
    update(delta) {
        if (!TimeManager.shouldUpdate()) return;
        this.refreshSpatialGrid();
    }

    /**
     * 투사체 발사 (원거리 공격)
     */
    fireProjectile(type, attacker, target, multiplier = 1.0) {
        if (type === 'arrow') {
            projectileManager.fire('arrow', attacker, target, {
                damageMultiplier: multiplier
            });
        } else if (type === 'light') {
            projectileManager.fire('light', attacker, target, {
                damageMultiplier: multiplier
            });
        } else if (type === 'wizard') {
            projectileManager.fire('wizard', attacker, target, {
                damageMultiplier: multiplier
            });
        } else if (type === 'meteor') {
            projectileManager.fire('meteor', attacker, target, {
                damageMultiplier: multiplier
            });
        }
    }

    /**
     * 데미지 발생 라우팅
     */
    processDamage(attackerEntity, targetEntity, config = {}, type = 'physical', isUltimate = false) {
        // config가 숫자(multiplier)일 수도 있고 객체({multiplier, projectileId})일 수도 있음
        let multiplier = 1.0;
        let projectileId = null;

        if (typeof config === 'number') {
            multiplier = config;
        } else if (typeof config === 'object') {
            multiplier = config.multiplier !== undefined ? config.multiplier : 1.0;
            projectileId = config.projectileId || null;
        }

        const attacker = attackerEntity.logic;
        const target = targetEntity.logic;
        
        let damage = 0;
        if (type === 'physical') {
            damage = COMBAT.calcPhysicalDamage(attacker.getTotalAtk(), multiplier);
        } else {
            damage = COMBAT.calcMagicEffect(attacker.getTotalMAtk(), multiplier);
        }

        if (targetEntity && targetEntity.takeDamage) {
            Logger.info("COMBAT_MANAGER", `Processing ${type} damage: ${attacker.name} -> ${target.name} (${damage}) ${projectileId ? `[Proj: ${projectileId}]` : ''}`);
            targetEntity.takeDamage(damage, attackerEntity);
            
            // 데미지 기록 (투사체 ID가 있으면 함께 기록)
            damageCalculationManager.recordDamage(attacker, target, damage, type, projectileId);
            
            fxManager.showDamageText(targetEntity.x, targetEntity.y, damage, type);
            fxManager.showImpactEffect(targetEntity, type);

            if (type === 'physical') {
                soundManager.playPhysicalHit();
            }

            if (!isUltimate && attackerEntity.gainUltimateCharge) {
                attackerEntity.gainUltimateCharge(1);
            }

            if (targetEntity.gainUltimateCharge) {
                targetEntity.gainUltimateCharge(1);
            }
        }
    }

    /**
     * 일반 공격 실행 (AI에서 호출)
     */
    executeNormalAttack(attackerEntity, targetEntity) {
        if (!attackerEntity.active || !targetEntity.active) return;
        if (!attackerEntity.logic.isAlive || !targetEntity.logic.isAlive) return;

        const isAlly = attackerEntity.team === targetEntity.team;
        const className = attackerEntity.logic.class.getClassName();

        if (isAlly && className === 'healer') {
            this.processHeal(attackerEntity, targetEntity, 1.0);
        } else if (!isAlly) {
            // [USER 요청] 힐러는 빛의 투사체(light) 발사
            if (className === 'healer') {
                this.fireProjectile('light', attackerEntity, targetEntity, 1.0);
            } else if (className === 'wizard') {
                this.fireProjectile('wizard', attackerEntity, targetEntity, 1.0);
            } else if (className === 'archer') {
                this.fireProjectile('arrow', attackerEntity, targetEntity, 1.0);
            } else {
                this.processDamage(attackerEntity, targetEntity, 1.0, 'physical');
            }
        }
    }

    /**
     * 힐 발생 라우팅
     */
    processHeal(healerEntity, targetEntity, multiplier = 1.0) {
        const healer = healerEntity.logic;
        const target = targetEntity.logic;

        const healAmount = healer.getTotalMAtk() * multiplier;

        if (targetEntity && targetEntity.heal) {
            Logger.info("COMBAT_MANAGER", `Processing HEAL: ${healer.name} -> ${target.name} (${healAmount.toFixed(1)})`);
            targetEntity.heal(healAmount);
            damageCalculationManager.recordHeal(healer, target, healAmount);
            fxManager.showDamageText(targetEntity.x, targetEntity.y, Math.floor(healAmount), 'heal');
            fxManager.showHealEffect(targetEntity);
        }
    }

    refreshSpatialGrid() { /* Spatial Partitioning Placeholder */ }
    addUnit(unit) { this.units.add(unit); }
    removeUnit(unit) { this.units.delete(unit); }
}

const combatManager = new CombatManager();
export default combatManager;
