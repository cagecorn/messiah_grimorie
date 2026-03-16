import TotemistAI from './TotemistAI.js';

/**
 * 주주 전용 AI (Joojoo AI)
 * 역할: [기본적인 토템술사 동작 수행]
 */
class JoojooAI {
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        // 1. 궁극기 (치유 토템) 체크
        if (entity.isUltimateReady()) {
            entity.useUltimate();
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 2. 일반 스킬 (화염 토템) 체크
        if (entity.isSkillReady('fire_totem_summon')) {
            entity.useSkill('fire_totem_summon');
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 3. 기본 토템술사 동작 (거리 유지 및 평타)
        TotemistAI.execute(entity, bb, delta);
    }
}

export default JoojooAI;
