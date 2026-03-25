import BardAI from './BardAI.js';
import RogueAI from './RogueAI.js';
import { ENTITY_CLASSES } from '../../../core/EntityConstants.js';

/**
 * 나나 AI (Nana AI)
 * 역할: [바드 모드와 로그 모드를 오가며 상황에 맞는 행동 결정]
 */
class NanaAI {
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        // 1. 궁극기 체크 (사용 가능하면 즉시 변신)
        if (entity.isUltimateReady()) {
            entity.useUltimate();
            // 변신 직후에는 프레임이 튈 수 있으므로 리턴
            return;
        }

        // 2. 현재 클래스에 따라 행동 분기 (TransformationManager에 의해 변경됨)
        const currentClass = entity.logic.class.getClassName();

        if (currentClass === ENTITY_CLASSES.BARD) {
            // 바드인 경우 스킬 사용 체크 (아군 버프 위주)
            if (bb.get('target')) {
                entity.useSkill('MusicalMagicalCritical');
            }
            // 바드 AI (도망다니며 아군 보조)
            BardAI.execute(entity, bb, delta);
        } else {
            // [로그 모드] 적극적으로 근접 근접 전투 및 암살 시도
            RogueAI.execute(entity, bb, delta);
        }
    }
}

export default NanaAI;
