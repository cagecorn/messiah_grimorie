import Logger from '../../utils/Logger.js';

/**
 * 음반 DOM 매니저 (Music DOM Manager)
 */
class MusicDOMManager {
    constructor() {
        Logger.system("MusicDOMManager: Initialized.");
    }

    ui_openJukebox() {
        Logger.info("UI_ROUTER", "Opening Music Jukebox UI.");
    }

    ui_updateNowPlaying(title) {
        Logger.info("UI_ROUTER", `Updating HUD with track: ${title}`);
    }
}

const musicDOMManager = new MusicDOMManager();
export default musicDOMManager;
