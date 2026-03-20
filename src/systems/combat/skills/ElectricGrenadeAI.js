import combatManager from '../../CombatManager.js';
import coordinateManager from '../../combat/CoordinateManager.js';

/**
 * 전기 수류탄 AI (Electric Grenade AI)
 * 역할: [적이 가장 많이 뭉쳐있는 지점을 포착]
 */
class ElectricGrenadeAI {
    /**
     * @param {CombatEntity} owner 
     * @returns {Object|null} {x, y} 좌표
     */
    static decideGrenadeTarget(owner) {
        const enemies = [];
        combatManager.units.forEach(unit => {
            if (unit.active && unit.logic.isAlive && unit.team !== owner.team) {
                enemies.push(unit);
            }
        });

        if (enemies.length === 0) return null;

        // 적절한 AOE 반경(120)을 기준으로 최적의 타겟 지점 계산
        const targetPoint = coordinateManager.getBestAOETarget(enemies, 120);
        return targetPoint;
    }
}

export default ElectricGrenadeAI;
