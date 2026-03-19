/**
 * 바오 궁극기 AI: 가라! 바바오! (Babao AI)
 * 역할: [궁극기 게이지 충전 시 즉시 발동]
 */
class UltimateBabaoAI {
    /**
     * @param {CombatEntity} entity 
     * @returns {boolean} 궁극기 발동 여부
     */
    static update(entity) {
        if (!entity || !entity.skills) return false;

        if (!entity.isUltimateReady()) return false;

        // 궁극기 ID: 'bao_ult'
        entity.useUltimate('bao_ult');
        return true;
    }
}

export default UltimateBabaoAI;
