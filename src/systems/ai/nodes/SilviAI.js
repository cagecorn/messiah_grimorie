import MeleeAI from './MeleeAI.js';
import StoneSkinAI from './StoneSkinAI.js';

/**
 * 실비 전용 AI 노드 (Silvi Specialized AI)
 * 역할: [실비의 고유 스킬(스톤 스킨) 사용 로직 포함]
 */
class SilviAI {
    static execute(entity, bb, delta) {
        if (!entity.logic.isAlive) return;

        // 1. 고유 스킬 (Stone Skin) 체크
        if (StoneSkinAI.update(entity)) {
            bb.set('state', 'skill');
            return;
        }

        // 2. 기본 근접 공격/이동 로직 수행
        MeleeAI.execute(entity, bb, delta);
    }
}

export default SilviAI;
