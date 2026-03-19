import Logger from '../../../utils/Logger.js';
import skillManager from '../../combat/SkillManager.js';

/**
 * 바바오 자동 소환 AI 노드 (Summon Babao AI Node)
 * 역할: [던전 입장 시 또는 바바오가 없을 때 즉시 소환 스킬 트리거]
 */
class SummonBabaoAI {
    /**
     * @param {CombatEntity} entity 시전자 (바오)
     */
    static update(entity) {
        // 1. 이미 소환되었는지 확인 (Skill 객체 내부 맵 활용)
        const summonSkill = skillManager.getSkill('SummonBabao');
        if (!summonSkill) return false;

        const activeSummon = summonSkill.activeSummons.get(entity.logic.id);
        
        // 2. 바바오가 없거나 죽었다면 즉시 소환 시도
        if (!activeSummon || !activeSummon.active || !activeSummon.logic.isAlive) {
            Logger.info("AI", `${entity.logic.name} triggers automatic summon: Babao!`);
            summonSkill.execute(entity);
            return true; // 행동 점유 (소환하는 프레임에는 다른 행동 제한 가능)
        }

        return false;
    }
}

export default SummonBabaoAI;
