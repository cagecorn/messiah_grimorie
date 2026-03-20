import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import combatManager from '../CombatManager.js';

/**
 * AOE 매니저 (AOE Manager)
 * 역할: [범위 판정 및 데미지 일괄 적용]
 */
class AOEManager {
    /**
     * 범위 데미지 적용
     * @param {CombatEntity} source 시전자
     * @param {number} x 중심 X
     * @param {number} y 중심 Y
     * @param {number} radius 반경
     * @param {number} multiplier 계수
     * @param {string} type 데미지 종류 ('physical', 'magic')
     * @param {string} attribute 데미지 속성 ('fire', 'ice', 'lightning', 'none')
     * @param {function} onHit 각 타겟 피격 시 콜백
     * @param {boolean} isUltimate 궁극기 여부
     */
    applyAOEDamagingEffect(source, x, y, radius, multiplier, type, attribute = 'none', onHit, isUltimate = false) {
        if (!source) return;

        // [Refactor] CombatManager의 통합 유닛 Set 사용
        const allEntities = combatManager.units;
        
        if (!allEntities || allEntities.size === 0) {
            Logger.warn("AOE_MANAGER", "No units registered in CombatManager for AOE check.");
            return;
        }

        Logger.debug("AOE_MANAGER", `Checking AOE at (${Math.round(x)}, ${Math.round(y)}) with radius ${radius}. Pool size: ${allEntities.size}`);

        const targets = [];
        allEntities.forEach(target => {
            if (!target.active || !target.logic || !target.logic.isAlive) return;
            if (target.team === source.team) return;

            const distFeet = Phaser.Math.Distance.Between(x, y, target.x, target.y);
            const distBody = Phaser.Math.Distance.Between(x, y, target.x, target.y - 40);
            const minDist = Math.min(distFeet, distBody);

            if (minDist <= radius) {
                targets.push(target);
            }
        });

        if (targets.length === 0) {
            Logger.info("COMBAT", `[AOE_MISS] No targets found by ${source.logic.name} at (${Math.round(x)}, ${Math.round(y)}) with radius ${radius}.`);
        } else {
            targets.forEach(target => {
                // [FIX] processDamage 시그니처 대응 (multiplier, type, attribute, projectileId, isUltimate)
                combatManager.processDamage(source, target, multiplier, type, attribute, null, isUltimate);
                if (onHit) onHit(target);
            });
            Logger.info("COMBAT", `[AOE_HIT] ${targets.length} targets hit by ${source.logic.name} at (${Math.round(x)}, ${Math.round(y)}) with radius ${radius}.`);
        }
    }

    /**
     * [LEGACY/WRAPPER] 구형 applyAOE 호출 대응
     */
    applyAOE(x, y, config) {
        const { radius, multiplier, owner, damageType, attribute, onHit, isUltimate } = config;
        this.applyAOEDamagingEffect(owner, x, y, radius, multiplier, damageType || 'magic', attribute || 'none', onHit, isUltimate);
    }
}

const aoeManager = new AOEManager();
export default aoeManager;
