/**
 * 분신술 AI 노드 (Cloning AI Node)
 * 역할: [자인이 궁극기 게이지가 가득 차면 즉시 시전]
 */
class CloningAI {
    /**
     * @param {CombatEntity} entity 
     * @returns {boolean} 스킬 사용 여부
     */
    static update(entity) {
        if (!entity || !entity.active || !entity.logic.isAlive) return false;

        // 이미 궁극기가 활성화 중이라면 보충 및 사용 불가
        if (entity.isUltActive) return false;

        // 궁극기 게이지 체크 (entity.skills.isUltimateReady 활용)
        if (entity.skills && entity.skills.isUltimateReady()) {
            entity.skills.useUltimate();
            return true;
        }

        return false;
    }
}

export default CloningAI;
