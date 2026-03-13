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

        // 적진의 무게 중심 근처면 시전
        if (entity.skills.useUltimate()) {
            Logger.info("AI", `${entity.logic.name} decided to use ULTIMATE: Threads of Fate!`);
            return true;
        }

        return false;
    }
}

export default ThreadsOfFateAI;
