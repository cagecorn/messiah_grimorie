/**
 * 멀린 궁극기 AI: 메테오 스트라이크 (Meteor Strike AI)
 * 역할: [궁극기 게이지 충전 시 즉시 발동]
 */
class MeteorStrikeAI {
    /**
     * @param {CombatEntity} entity 
     * @returns {boolean} 궁극기 발동 여부
     */
    static update(entity) {
        if (!entity || !entity.skills) return false;

        // 궁극기 게이지 확인 (EntitySkillComponent는 0~1.0 범위를 사용함)
        if (!entity.isUltimateReady()) return false;

        // 궁극기 실행 (ID는 UltimateManager에 정의된 'merlin_ult')
        entity.useUltimate('merlin_ult');
        return true;
    }
}

export default MeteorStrikeAI;
