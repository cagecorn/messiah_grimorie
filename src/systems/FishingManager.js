import Logger from '../utils/Logger.js';

/**
 * 낚시 매니저 (Fishing Manager)
 * 역할: [라우터 & 낚시 미니게임 제어]
 */
class FishingManager {
    constructor() {
        Logger.system("FishingManager: Initialized (Angler hub ready).");
    }

    /**
     * 낚시 시작 라우팅
     */
    startFishing(spotId) {
        Logger.info("FISHING_ROUTER", `Routing fishing start at spot: ${spotId}`);
    }

    /**
     * 낚시 결과 처리 라우팅
     */
    processCatch(result) {
        Logger.info("FISHING_ROUTER", "Routing catch result processing.");
    }
}

const fishingManager = new FishingManager();
export default fishingManager;
