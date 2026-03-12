import Logger from '../utils/Logger.js';

/**
 * NPC 매니저 (NPC Manager)
 * 역할: [라우터 & NPC 상호작용 허브]
 */
class NPCManager {
    constructor() {
        this.npcs = new Map();
        Logger.system("NPCManager: Initialized (Social hub ready).");
    }

    /**
     * 상호작용 라우팅
     */
    interact(npcId) {
        Logger.info("NPC_ROUTER", `Routing interaction with NPC: ${npcId}`);
    }

    /**
     * NPC 대사 출력 라우팅
     */
    showDialogue(npcId, dialogueId) {
        Logger.info("NPC_ROUTER", `Routing dialogue request: ${npcId} -> ${dialogueId}`);
    }
}

const npcManager = new NPCManager();
export default npcManager;
