import Logger from '../../utils/Logger.js';

/**
 * NPC DOM 매니저 (NPC DOM Manager)
 */
class NPCDOMManager {
    constructor() {
        Logger.system("NPCDOMManager: Initialized.");
    }

    ui_showSpeechBubble(npcId, text) {
        Logger.info("UI_ROUTER", `Showing speech bubble for ${npcId}: ${text}`);
    }

    ui_openInteractionMenu(npcId) {
        Logger.info("UI_ROUTER", `Opening interaction menu for NPC: ${npcId}`);
    }
}

const npcDOMManager = new NPCDOMManager();
export default npcDOMManager;
