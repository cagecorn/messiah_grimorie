import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import coordinateManager from '../../combat/CoordinateManager.js';

/**
 * 운명의 끈 AI 노드 (Threads of Fate AI Node)
 * 역할: [궁극기 게이지가 차면 적진 중심을 향해 시전]
 */
class ThreadsOfFateAI {
    /**
     * @param {CombatEntity} entity 시전자
     * @param {Array<CombatEntity>} enemies 적군 리스트
     */
    static update(entity, enemies) {
        if (!entity.hasUltimate || entity.ultimateProgress < 1.0) return false;

        const activeEnemies = enemies.filter(e => e.active && e.logic.isAlive);
        if (activeEnemies.length === 0) return false;

        // 3. 군집 분석 및 시전 결정
        const targetPoint = coordinateManager.getBestAOETarget(activeEnemies, 250);
        
        if (entity.skills.useUltimate(targetPoint)) {
            Logger.info("AI", `${entity.logic.name} decided to use ULTIMATE: Threads of Fate!`);
            return true;
        }

        return false;
    }
}

export default ThreadsOfFateAI;
