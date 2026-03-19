import MeleeAI from './MeleeAI.js';
import BloodRageAI from './BloodRageAI.js';

/**
 * 킹 AI (King AI)
 * 역할: [근접 전투 수행 중 블러드 레이지를 상시 유지 시도]
 */
class KingAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Blackboard} bb 
     * @param {number} delta 
     */
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        // 1. 타겟이 있는 전투 상태라면 블러드 레이지 발동 체크
        if (bb.get('target')) {
            BloodRageAI.execute(entity);
        }

        // 2. 기본 전사 AI 행동 (추격 및 공격) 수행
        MeleeAI.execute(entity, bb, delta);
    }
}

export default KingAI;
