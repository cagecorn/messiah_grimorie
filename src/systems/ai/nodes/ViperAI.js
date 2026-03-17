import SinkingShadowAI from './SinkingShadowAI.js';
import MeleeAI from './MeleeAI.js';

/**
 * 바이퍼 AI 노드 (Viper AI Node)
 * 역할: [로그 기본 기동 + 씽킹 섀도우 스킬 연계]
 */
class ViperAI {
    /**
     * @param {CombatEntity} entity 
     * @param {AIBlackboard} bb 
     * @param {number} delta 
     */
    static execute(entity, bb, delta) {
        if (!entity.logic.isAlive) return;

        const enemies = (entity.team === 'mercenary') ? 
            entity.scene.enemies : entity.scene.allies;

        // 1. 스킬 사용 결정 (적 밀집 지역 노림)
        if (SinkingShadowAI.update(entity, enemies)) {
            bb.set('state', 'skill');
            return true;
        }

        // 2. 기본 근접 AI 행동 수행
        MeleeAI.execute(entity, bb);
        return true;
    }
}

export default ViperAI;
