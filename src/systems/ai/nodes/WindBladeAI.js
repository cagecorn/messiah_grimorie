import Logger from '../../../utils/Logger.js';

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

        // 스킬 가용성 확인 및 사용 (EntitySkillComponent 프록시 활용)
        if (entity.isSkillReady('windblade')) {
            entity.useSkill('windblade');
            Logger.info("RIA_AI", `${entity.logic.name} activated Wind Blade!`);
        }
    }
}

export default WindBladeAI;
