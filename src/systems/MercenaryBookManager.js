import Logger from '../utils/Logger.js';

/**
 * 용병도감 매니저 (Mercenary Book Manager)
 * 역할: [라우터 & 수집 데이터 허브]
 */
class MercenaryBookManager {
    constructor() {
        this.unlockedEntries = new Set();
        Logger.system("MercenaryBookManager: Initialized (Collection hub ready).");
    }

    /**
     * 도감 항목 해금 라우팅
     */
    unlockEntry(mercenaryId) {
        this.unlockedEntries.add(mercenaryId.toLowerCase());
        Logger.info("COLLECTION", `Mercenary entry unlocked: ${mercenaryId}`);
    }

    /**
     * 보너스 스탯 합산 라우팅
     */
    calculateCollectionBonus() {
        Logger.info("COLLECTION", "Calculating global bonuses from unlocked mercenaries.");
    }
}

const mercenaryBookManager = new MercenaryBookManager();
export default mercenaryBookManager;
