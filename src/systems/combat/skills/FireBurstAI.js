import Phaser from 'phaser';
import combatManager from '../../CombatManager.js';
import coordinateManager from '../../combat/CoordinateManager.js';

/**
 * 파이어 버스트 AI (Fire Burst AI)
 * 역할: [가장 적이 많이 뭉쳐있는 곳을 타겟팅]
 */
class FireBurstAI {
    /**
     * @param {CombatEntity} owner 
     * @returns {CombatEntity|null}
     */
    static decideFireBurstTarget(owner) {
        const enemies = [];
        combatManager.units.forEach(unit => {
            if (unit.active && unit.logic.isAlive && unit.team !== owner.team) {
                enemies.push(unit);
            }
        });

        if (enemies.length === 0) return null;

        // 2. 밀집 지역 타겟팅 (CoordinateManager 활용)
        const targetPoint = coordinateManager.getBestAOETarget(enemies, 150);
        
        // 타겟 포인트와 가장 일치하는 유닛 반환 또는 첫번째 적
        return enemies.find(e => e.x === targetPoint.x && e.y === targetPoint.y) || enemies[0];
    }
}

export default FireBurstAI;
