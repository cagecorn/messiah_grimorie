import Logger from './MeleeAI.js'; // MeleeAI 등을 참고하여 작성

/**
 * 윈드 블레이드 AI 노드 (Wind Blade AI Node)
 * 역할: [스킬이 준비되면 즉시 사용하는 단순 사고]
 */
class WindBladeAI {
    /**
     * AI 로직 실행
     * @param {CombatEntity} entity 
     * @param {AIBlackboard} bb 
     */
    static execute(entity, bb) {
        if (!entity.logic.isAlive) return;

        // 이미 버프가 걸려있는지 확인 (중복 사용 방지)
        if (entity.buffs && entity.buffs.getActiveBuffIds().includes('gale')) {
            return;
        }

        // 스킬 가용성 확인
        const skillProgress = entity.skillProgress;
        if (skillProgress >= 100) {
            const skillData = entity.skillData;
            if (skillData && skillData.logic) {
                skillData.logic.execute(entity);
                // 스킬 사용 후 게이지 리셋은 SkillManager나 EntitySkillComponent에서 처리하지만
                // 명시적으로 여기서 하기도 함 (기록용)
                entity.skillProgress = 0;
            }
        }
    }
}

export default WindBladeAI;
