import FlyingManAI from './FlyingManAI.js';
import TornadoShotAI from './TornadoShotAI.js';

/**
 * 세인 AI 노드 (Sein AI Node)
 * 역할: [플라잉맨 기본 기동 + 토네이도 샷 스킬 연계]
 */
class SeinAI {
    /**
     * @param {CombatEntity} entity 
     * @param {AIBlackboard} bb 
     * @param {number} delta 
     */
    static execute(entity, bb, delta) {
        if (!entity.logic.isAlive) return;

        const enemies = (entity.team === 'mercenary') ? 
            entity.scene.enemies : entity.scene.allies;

        // 1. 스킬 사용 결정 (적 밀집 지역 노림)
        if (TornadoShotAI.update(entity, enemies)) {
            bb.set('state', 'skill');
            return true;
        }

        // 2. 기본 비행형 AI 행동 수행 (원거리 카이팅 등)
        FlyingManAI.execute(entity, bb);
        return true;
    }
}

export default SeinAI;
