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
     * @param {string} type 데미지 속성
     * @param {function} onHit 각 타겟 피격 시 콜백
     * @param {boolean} isUltimate 궁극기 여부
     */
    applyAOEDamagingEffect(source, x, y, radius, multiplier, type, onHit, isUltimate = false) {
        if (!source) return;

        // [Refactor] CombatManager의 통합 유닛 Set 사용 (더 신뢰성 높고 원격 가능)
        const allEntities = combatManager.units;
        
        if (!allEntities || allEntities.size === 0) {
            Logger.warn("AOE_MANAGER", "No units registered in CombatManager for AOE check.");
            return;
        }

        const targets = [];
        allEntities.forEach(target => {
            if (!target.active || !target.logic || !target.logic.isAlive) return;
            
            // 적대 관계 확인 (시전자와 다른 팀)
            if (target.team === source.team) return;

            // [FIX] 거리 계산 로직 개선 (발/몸통 동시 판정)
            // 지면(발) 점과 유닛 중심(몸통 -40px) 점 중 폭발 원점과 더 가까운 지점 채택
            const distFeet = Phaser.Math.Distance.Between(x, y, target.x, target.y);
            const distBody = Phaser.Math.Distance.Between(x, y, target.x, target.y - 40);
            const minDist = Math.min(distFeet, distBody);

            if (minDist <= radius) {
                targets.push(target);
            }
        });

        targets.forEach(target => {
            // 데미지 처리 (CombatManager에 의뢰)
            combatManager.processDamage(source, target, multiplier, type, isUltimate);
            
            if (onHit) onHit(target);
        });

        if (targets.length > 0) {
            Logger.info("COMBAT", `[AOE_HIT] ${targets.length} targets hit by ${source.logic.name} at (${Math.round(x)}, ${Math.round(y)}) with radius ${radius}.`);
        } else if (allEntities.size > 0) {
            // Logger.debug("AOE_TRACE", `AOE check: 0 hits out of ${allEntities.size} units.`);
        }
    }
}

const aoeManager = new AOEManager();
export default aoeManager;
