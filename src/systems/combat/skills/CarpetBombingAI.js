import combatManager from '../../CombatManager.js';
import coordinateManager from '../../combat/CoordinateManager.js';

/**
 * 융단폭격 AI (Carpet Bombing AI)
 * 역할: [적이 가장 많이 뭉쳐있는 지점을 포착하여 폭격 지점 결정]
 */
class CarpetBombingAI {
    /**
     * @param {CombatEntity} owner 
     * @returns {Object|null} {x, y} 좌표
     */
    static decideBombingTarget(owner) {
        const enemies = [];
        combatManager.units.forEach(unit => {
            if (unit.active && unit.logic.isAlive && unit.team !== owner.team) {
                enemies.push(unit);
            }
        });

        if (enemies.length === 0) return null;

        // 융단폭격은 넓은 범위(250)를 커버하므로 넉넉한 반경으로 최적의 타겟 지점 계산
        const targetPoint = coordinateManager.getBestAOETarget(enemies, 250);
        return targetPoint;
    }
}

export default CarpetBombingAI;
