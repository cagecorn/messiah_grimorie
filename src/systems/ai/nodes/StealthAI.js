/**
 * 은신 AI (Stealth AI)
 * 역할: [자인이 쿨타임마다 은신을 사용하도록 유도]
 */
class StealthAI {
    /**
     * @param {CombatEntity} entity 
     * @returns {boolean} 스킬 사용 여부
     */
    static update(entity) {
        if (!entity || !entity.active || !entity.logic.isAlive) return false;

        // 이미 은신 중이면 스킵
        if (entity.logic.status.states && entity.logic.status.states.stealthed) return false;

        // 쿨타임 체크 (entity.isSkillReady 활용)
        if (entity.isSkillReady('stealth')) {
            entity.useSkill('stealth');
            return true;
        }

        return false;
    }
}

export default StealthAI;
