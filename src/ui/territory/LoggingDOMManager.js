import Logger from '../../utils/Logger.js';

/**
 * 벌목 DOM 매니저 (Logging DOM Manager)
 */
class LoggingDOMManager {
    constructor() {
        Logger.system("LoggingDOMManager: Initialized.");
    }

    ui_showLoggingOverlay() {
        Logger.info("UI_ROUTER", "Displaying logging node interaction UI.");
    }
}

const loggingDOMManager = new LoggingDOMManager();
export default loggingDOMManager;
