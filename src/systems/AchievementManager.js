import Logger from '../utils/Logger.js';

/**
 * 업적 매니저 (Achievement Manager)
 * 역할: [라우터 & 성과 추적기]
 */
class AchievementManager {
    constructor() {
        this.completedAchievements = new Set();
        Logger.system("AchievementManager: Initialized (Glory hub ready).");
    }

    /**
     * 업적 진척도 업데이트 라우팅
     */
    updateProgress(achievementId, value) {
        Logger.info("ACHIEVEMENT_ROUTER", `Routing progress update: ${achievementId} -> ${value}`);
    }

    /**
     * 보상 수령 라우팅
     */
    claimReward(achievementId) {
        Logger.info("ACHIEVEMENT_ROUTER", `Routing reward claim: ${achievementId}`);
    }
}

const achievementManager = new AchievementManager();
export default achievementManager;
