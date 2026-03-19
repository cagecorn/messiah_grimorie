import WizardAI from './WizardAI.js';
import SkillStoneBlastAI from './SkillStoneBlastAI.js';
import SummonBabaoAI from './SummonBabaoAI.js';
import UltimateGoBabaoAI from './UltimateGoBabaoAI.js';

/**
 * 바오 전용 AI 노드 (Bao Specialized AI)
 * 역할: [바오의 고유 스킬(스톤 블래스트) 및 궁극기(가라! 바바오!) 사용 로직 포함]
 */
class BaoAI {
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        // 0. 소환물 체크 (바바오 자동 소환)
        if (SummonBabaoAI.update(entity)) return;

        // 1. 궁극기 체크
        if (UltimateGoBabaoAI.update(entity)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        const enemies = (entity.team === 'mercenary') ? entity.scene.enemies : entity.scene.allies;

        // 2. 고유 스킬 체크
        if (SkillStoneBlastAI.tick(entity, enemies)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 3. 기본 위자드 행동 로직 수행 (거리 유지 및 평타)
        WizardAI.execute(entity, bb, delta);
    }
}

export default BaoAI;
