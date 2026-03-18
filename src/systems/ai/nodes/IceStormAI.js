import SpawnIceStormAI from './SpawnIceStormAI.js';

/**
 * 아이나 궁극기 AI (Ice Storm AI)
 * 역할: [궁극기 게이지 충전 시 즉시 시전]
 */
class IceStormAI {
    /**
     * @param {CombatEntity} entity 
     * @returns {boolean} 궁극기 발동 여부
     */
    static tick(entity) {
        if (!entity || !entity.skills) return false;
 
        // 1. 궁극기 준비 여부 확인
        if (!entity.isUltimateReady()) return false;
 
        // 2. 적진 밀집 지역 계산 후 시전
        const spawnPoint = SpawnIceStormAI.getBestSpawnPoint(entity);
        entity.useUltimate(spawnPoint);
        
        return true;
    }
}

export default IceStormAI;
