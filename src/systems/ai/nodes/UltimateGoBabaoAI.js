import Logger from '../../../utils/Logger.js';
import skillManager from '../../combat/SkillManager.js';

/**
 * 전용 궁극기 AI 노드: 가라! 바바오! (Ultimate Go Babao AI)
 * 역할: [게이지가 가득 차고 바바오가 필드에 있을 때 즉시 발동]
 */
class UltimateGoBabaoAI {
    static update(entity) {
        // 1. 게이지 체크
        if (!entity.hasUltimate || entity.ultimateProgress < 1.0) return false;

        // 2. 시전 (바바오 존재 여부와 상관없이 게이지가 차면 지름. GoBabao.js에서 재소환 처리함)
        if (entity.skills.useUltimate()) {
            Logger.info("AI", `${entity.logic.name} decided to use ULTIMATE: Go Babao!`);
            return true;
        }

        return false;
    }
}

export default UltimateGoBabaoAI;
