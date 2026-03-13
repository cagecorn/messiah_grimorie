import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';

/**
 * 수호천사 소환 AI 노드 (Summon Guardian Angel AI Node)
 * 역할: [궁극기 게이지가 가득 찼을 때 즉시 시전]
 */
class SummonGuardianAngelAI {
    /**
     * @param {CombatEntity} entity 시전자 (세라)
     * @param {Array<CombatEntity>} allies 아군 리스트 (천사가 아군인지 확인용)
     */
    static update(entity, allies) {
        // 1. 궁극기 가능 여부 및 게이지 체크
        if (!entity.hasUltimate || entity.ultimateProgress < 1.0) return false;

        // 2. [USER 요청] 조건이 될 때마다 시전 (소환 또는 강화/힐)
        if (entity.skills.useUltimate()) {
            Logger.info("AI", `${entity.logic.name} decided to use ULTIMATE: Summon Guardian Angel!`);
            return true; // 행동 선점
        }

        return false;
    }
}

export default SummonGuardianAngelAI;
