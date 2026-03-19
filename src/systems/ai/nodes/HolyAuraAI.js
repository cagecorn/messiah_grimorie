import Logger from '../../../utils/Logger.js';

/**
 * 홀리 오라 AI 노드 (Holy Aura AI)
 * 역할: [오라가 꺼져있을 때 전투 중 상시 발동]
 */
class HolyAuraAI {
    static update(entity) {
        if (!entity || !entity.skills) return false;

        const skillId = 'HolyAura';
        const skill = entity.skills.getSkill(skillId);
        
        if (!skill) return false;

        // 오라가 현재 활성화되어 있지 않다면 활성화 시도
        // (AuraSkill 클래스는 내부 logic 객체에 activeAuras 맵을 가짐)
        if (!skill.logic.activeAuras.has(entity.logic.id)) {
            if (entity.skills.useSkill(skillId)) {
                Logger.info("AI", `${entity.logic.name} activated Holy Aura.`);
                return true;
            }
        }

        return false;
    }
}

export default HolyAuraAI;
