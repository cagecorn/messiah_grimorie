import Logger from '../utils/Logger.js';

/**
 * 채광 매니저 (Mining Manager)
 * 역할: [라우터 & 광석 채집 제어]
 */
class MiningManager {
    constructor() {
        Logger.system("MiningManager: Initialized (Excavation hub ready).");
    }

    /**
     * 채광 실행 라우팅
     */
    executeMining(nodeId) {
        Logger.info("MINING_ROUTER", `Routing mining execution: ${nodeId}`);
    }
}

const miningManager = new MiningManager();
export default miningManager;
