import Logger from '../utils/Logger.js';

/**
 * 벌목 매니저 (Logging Manager)
 * 역할: [라우터 & 목재 채집 제어]
 */
class LoggingManager {
    constructor() {
        Logger.system("LoggingManager: Initialized (Timber hub ready).");
    }

    /**
     * 벌목 실행 라우팅
     */
    executeLogging(nodeId) {
        Logger.info("LOGGING_ROUTER", `Routing logging execution: ${nodeId}`);
    }
}

const loggingManager = new LoggingManager();
export default loggingManager;
