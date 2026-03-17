import FlyingManAI from './FlyingManAI.js';

/**
 * 세인 AI 노드 (Sein AI Node)
 * 역할: [FlyingMan 공통 AI를 기반으로 전용 스킬 사용 제어]
 */
class SeinAI {
    /**
     * @param {CombatEntity} entity 
     * @param {AIBlackboard} bb 
     * @param {number} delta 
     */
    static execute(entity, bb, delta) {
        // 기본 이동 및 공격은 FlyingManAI를 따름
        FlyingManAI.execute(entity, bb);

        // 스킬 사용 로직
        const target = bb.get('target');
        if (target && entity.canUseSkill()) {
            entity.useSkill(target);
        }
    }
}

export default SeinAI;
