import Logger from '../../utils/Logger.js';

/**
 * 패치 노트 DOM 매니저 (Patch Note DOM Manager)
 */
class PatchNoteDOMManager {
    constructor() {
        Logger.system("PatchNoteDOMManager: Initialized.");
    }

    ui_openPatchNotes() {
        Logger.info("UI_ROUTER", "Opening Patch Notes UI Overlay.");
    }

    ui_renderContent(notes) {
        Logger.info("UI_ROUTER", "Rendering patch note entries.");
    }
}

const patchNoteDOMManager = new PatchNoteDOMManager();
export default patchNoteDOMManager;
