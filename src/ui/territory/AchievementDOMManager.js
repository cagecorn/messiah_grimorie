import Logger from '../../utils/Logger.js';

/**
 * 업적 DOM 매니저 (Achievement DOM Manager)
 */
class AchievementDOMManager {
    constructor() {
        Logger.system("AchievementDOMManager: Initialized.");
    }

    ui_openAchievementBoard() {
        Logger.info("UI_ROUTER", "Opening Achievement Board UI.");
    }

    ui_showCompletionToast(id) {
        Logger.info("UI_ROUTER", `Routing visual alert for achievement completion: ${id}`);
    }
}

const achievementDOMManager = new AchievementDOMManager();
export default achievementDOMManager;
