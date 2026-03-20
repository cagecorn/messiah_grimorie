import RangedAI from './RangedAI.js';
import ElectricGrenade from '../../combat/skills/ElectricGrenade.js';

/**
 * 레오나 AI (Leona AI)
 * 역할: [원거리 거리를 유지하며 쿨타임마다 전기 수류탄 투척]
 */
class LeonaAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Blackboard} bb 
     * @param {number} delta 
     */
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        // 1. 궁극기 체크 (현재 Placeholder)
        // if (entity.isUltimateReady()) {
        //     entity.useUltimate('leona_ult');
        //     return;
        // }

        // 2. 스킬 사용 체크 (전기 수류탄)
        // [주의] 스킬 컴포넌트의 canUseSkill 등을 통해 쿨타임 체크가 내부적으로 수행됨
        if (bb.get('target')) {
            entity.useSkill('ElectricGrenade');
        }

        // 3. 기본 원거리 AI 행동 (사거리 유지 및 추격/카이팅)
        RangedAI.execute(entity, bb, delta);
    }
}

export default LeonaAI;
