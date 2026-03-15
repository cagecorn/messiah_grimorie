/**
 * 3. 투사체 회피 실행 노드 (Projectile Evasion)
 * 역할: [분류된 위협 데이터를 바탕으로 실제로 이동 처리]
 */
class ProjectileEvasion {
    /**
     * 회피 시도
     * @param {CombatEntity} entity 
     * @param {object} analysis 분석된 위협 데이터
     */
    static execute(entity, analysis) {
        if (!analysis || !analysis.isThreat) return false;

        // 논타겟인 경우만 이동 회피 (타겟팅은 이동해도 맞으므로)
        if (analysis.type === 'nonTele' && analysis.dodgeDir) {
            entity.moveDirection = analysis.dodgeDir;
            return true;
        }

        // 나중에 'parry' 타입 등이 추가되면 여기서 처리
        return false;
    }
}

export default ProjectileEvasion;
