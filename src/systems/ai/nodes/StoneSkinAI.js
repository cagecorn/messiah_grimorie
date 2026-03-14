/**
 * 스톤 스킨 AI 노드 (Stone Skin AI Node)
 * 역할: [실비의 생존기 사용 판단 - 쿨타임마다 즉시 사용]
 */
class StoneSkinAI {
    /**
     * @param {CombatEntity} entity
     * @returns {boolean} 스킬 사용 여부
     */
    static update(entity) {
        // 실비가 아닐 경우 패스 (보수적 설계)
        if (entity.logic.id.split('_')[0] !== 'silvi') return false;

        // 쿨다운 체크
        const skillId = 'stoneskin';
        if (!entity.skills || !entity.skills.isReady(skillId)) return false;

        // 자기 자신에게 사용
        entity.useSkill(skillId, entity);
        return true;
    }
}

export default StoneSkinAI;
