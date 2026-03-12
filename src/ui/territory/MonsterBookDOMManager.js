import Logger from '../../utils/Logger.js';

/**
 * 몬스터 도감 DOM 매니저 (Monster Book DOM Manager)
 */
class MonsterBookDOMManager {
    constructor() {
        Logger.system("MonsterBookDOMManager: Initialized.");
    }

    ui_openBestiary() {
        Logger.info("UI_ROUTER", "Opening Monster Bestiary UI.");
    }

    ui_renderMonsterDetails(id) {
        Logger.info("UI_ROUTER", `Rendering details for monster: ${id}`);
    }
}

const monsterBookDOMManager = new MonsterBookDOMManager();
export default monsterBookDOMManager;
