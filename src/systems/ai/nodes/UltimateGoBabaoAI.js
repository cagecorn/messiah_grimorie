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

        // 2. 바바오 존재 여부 체크 (궁극기 로직에서도 체크하지만 AI 선별용)
        const summonSkill = skillManager.getSkill('SummonBabao');
        if (!summonSkill) return false;

        const babao = summonSkill.activeSummons.get(entity.logic.id);
        if (!babao || !babao.active || !babao.logic.isAlive) {
            // 바바오가 없으면 우선 소환을 기다림 (SummonBabaoAI가 처리할 것)
            return false;
        }

        // 3. 시전
        if (entity.skills.useUltimate()) {
            Logger.info("AI", `${entity.logic.name} decided to use ULTIMATE: Go Babao!`);
            return true;
        }

        return false;
    }
}

export default UltimateGoBabaoAI;
