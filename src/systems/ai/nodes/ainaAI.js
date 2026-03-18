import WizardAI from './WizardAI.js';
import SkillIceBallAI from './SkillIceBallAI.js';
import IceStormAI from './IceStormAI.js';
import Logger from '../../../utils/Logger.js';

/**
 * 아이나 전용 AI 노드 (Aina Specialized AI)
 * 역할: [아이나의 고유 스킬 및 궁극기 사용 로직 포함]
 */
class AinaAI {
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        const enemies = (entity.team === 'mercenary') ? entity.scene.enemies : entity.scene.allies;

        // 1. 궁극기 (Ice Storm) 체크
        if (IceStormAI.tick(entity)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 2. 고유 스킬 (Ice Ball) 체크
        if (SkillIceBallAI.tick(entity, enemies)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 3. 기본 위자드 행동 로직 수행
        WizardAI.execute(entity, bb, delta);
    }
}

export default AinaAI;
