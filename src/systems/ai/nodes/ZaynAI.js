import RogueAI from './RogueAI.js';
import StealthAI from './StealthAI.js';
import CloningAI from './CloningAI.js';

/**
 * 자인 전용 AI 노드 (Zayn Specialized AI)
 * 역할: [은신 스킬 사용 및 로그 기본 전투 AI 수행]
 */
class ZaynAI {
    static execute(entity, bb, delta) {
        if (!entity.logic.isAlive) return;

        // 1. 행동 불가 상태 체크 (RogueAI 내부에서도 하지만 자인은 은신이 우선임)
        if (entity.status && entity.status.isUnableToAct()) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 2. 은신 스킬 사용 체크 (StealthAI 활용)
        if (StealthAI.update(entity)) {
            // 은신 사용 직후에도 공격은 계속해야 하므로 return 하지 않음
        }

        // [신규] 궁극기 사용 체크 (CloningAI 활용)
        if (CloningAI.update(entity)) {
            // 궁극기도 즉발 연출이므로 그대로 진행
        }

        // 3. 로그 공통 AI 수행 (후방 노리기, 점프 등)
        RogueAI.execute(entity, bb, delta);
    }
}

export default ZaynAI;
