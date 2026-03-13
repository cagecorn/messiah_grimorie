/**
 * 매스 힐 AI (Mass Heal AI Node)
 * 역할: [스킬 쿨타임이 차면 즉시 시전]
 */
class MassHealAI {
    /**
     * @param {CombatEntity} entity AI 주체 (세라)
     * @param {Blackboard} bb 
     */
    static execute(entity, bb) {
        if (!entity.active || !entity.logic.isAlive) return false;

        // 스킬 보유 여부 및 충전 상태 확인
        if (!entity.hasSkill || entity.skillProgress < 1.0) return false;

        // [USER 요청] 스킬 쿨타임이 찰 때마다 바로바로 시전
        console.log(`[MassHealAI] ${entity.logic.name} decided to use Mass Heal!`);
        
        // EntitySkillComponent의 useSkill 호출
        if (entity.skills.useSkill(entity.skillData.id)) {
            return true;
        }

        return false;
    }
}

export default MassHealAI;
