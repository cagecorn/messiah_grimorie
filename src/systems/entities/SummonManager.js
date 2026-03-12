import Logger from '../../utils/Logger.js';
import BaseEntity from '../../entities/BaseEntity.js';

/**
 * 소환물 매니저 (Summon Manager)
 * 역할: [전투 중 임시 소환되는 유닛 관리]
 */
class SummonManager {
    constructor() {
        this.summons = new Map();
    }

    createSummon(config, duration = 30000) {
        const summon = new BaseEntity({
            ...config,
            type: 'summon'
        });
        this.summons.set(summon.id, summon);

        // 일정 시간 후 자동 소멸
        setTimeout(() => {
            this.removeSummon(summon.id);
        }, duration);

        return summon;
    }

    removeSummon(id) {
        this.summons.delete(id);
        Logger.info("SUMMON", `Summon ${id} expired.`);
    }
}

const summonManager = new SummonManager();
export default summonManager;
