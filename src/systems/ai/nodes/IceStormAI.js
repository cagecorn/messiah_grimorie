/**
 * 아이나 궁극기 AI (Ice Storm AI)
 * 역할: [궁극기 게이지 충전 시 즉시 시전]
 */
class IceStormAI {
    /**
     * @param {CombatEntity} entity 
     * @returns {boolean} 궁극기 발동 여부
     */
    static tick(entity) {
        if (!entity || !entity.skills) return false;

        // 1. 궁극기 준비 여부 확인
        if (!entity.isUltimateReady()) return false;

        // 2. 시전 (타겟은 본인 위치 기준 소환이므로 null 또는 자신 전달)
        entity.useUltimate(entity);
        
        return true;
    }
}

export default IceStormAI;
