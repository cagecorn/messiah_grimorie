import BardAI from './BardAI.js';
import { updateSongOfProtectionAI } from '../../combat/skills/SongOfProtectionAI.js';
import SummonSirenAI from '../../combat/skills/SummonSirenAI.js';

/**
 * 루트 전용 AI 노드 (Lute Specialized AI)
 * 역할: [수호의 노래, 세이렌 소환 등 고유 스킬 사용 로직 포함]
 */
class LuteAI {
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        // 1. 고유 기술(수호의 노래) 및 궁극기(소환: 세이렌) 사용 체크
        updateSongOfProtectionAI(entity);
        if (SummonSirenAI.update(entity)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 2. 기본 바드 이동/공격/버프 로직 수행
        BardAI.execute(entity, bb, delta);
    }
}

export default LuteAI;
