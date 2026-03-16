import Logger from '../../../utils/Logger.js';

/**
 * 발도술 AI 노드 (Batto Jutsu AI Node)
 * 역할: [궁극기 게이지가 차면 즉시 사용]
 */
class BattoJutsuAI {
    /**
     * AI 로직 실행
     * @param {CombatEntity} entity 
     * @param {AIBlackboard} bb 
     */
    static execute(entity, bb) {
        if (!entity.logic.isAlive) return;

        // 이미 버프가 걸려있는지 확인 (중복 사용 방지)
        if (entity.buffs && entity.buffs.activeBuffs.find(b => b.id === 'rapidfire' || b.id === 'rapid_fire')) {
            return;
        }

        // 궁극기 가용성 확인 및 사용
        if (entity.isUltimateReady()) {
            entity.useUltimate();
            Logger.info("RIA_AI", `${entity.logic.name} used Ultimate: Battō-jutsu!`);
        }
    }
}

export default BattoJutsuAI;
