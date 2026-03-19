import Logger from '../../../utils/Logger.js';

/**
 * 블러드 레이지 AI 노드 (Blood Rage AI)
 * 역할: [쿨타임이 찰 때마다 즉시 기술 사용]
 */
class BloodRageAI {
    /**
     * @param {CombatEntity} entity 
     */
    static execute(entity) {
        if (!entity || !entity.skills) return false;

        const skillId = 'BloodRage';
        
        // 쿨타임이 차있으면 즉시 사용 (useSkill 내부에서 레디 체크 수행)
        if (entity.skills.useSkill(skillId)) {
            Logger.info("AI", `${entity.logic.name} used Blood Rage automatically.`);
            return true;
        }

        return false;
    }
}

export default BloodRageAI;
