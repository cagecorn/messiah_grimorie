import RangedAI from './RangedAI.js';
import tacticalCommandAI from '../../combat/skills/TacticalCommandAI.js';
import backInDaysAI from '../../combat/skills/BackInDaysAI.js';

/**
 * 니클 AI (Nickle AI)
 * 역할: [원거리 거리를 유지하며 쿨타임마다 전술지휘 및 궁극기 사용]
 */
class NickleAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Blackboard} bb 
     * @param {number} delta 
     */
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        // 1. 궁극기 체크 (왕년엔 말이야...)
        if (entity.isUltimateReady() && backInDaysAI.decide(entity)) {
            entity.useUltimate();
            return;
        }

        // 2. 스킬 사용 체크 (전술지휘)
        if (tacticalCommandAI.decide(entity)) {
            entity.useSkill('TacticalCommand');
        }

        // 3. 기본 원거리 AI 행동 (사거리 유지 및 추격/카이팅)
        RangedAI.execute(entity, bb, delta);
    }
}

export default NickleAI;
