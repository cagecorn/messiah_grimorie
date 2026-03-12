import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';

/**
 * 던전 스테이지 매니저 (Dungeon Stage Manager)
 * 역할: [던전 선택, 진입 및 전체 스테이지 진행 관리]
 */
class DungeonStageManager {
    constructor() {
        this.currentStageId = null;
        this.stages = new Map();
        Logger.system("DungeonStageManager: Initialized.");
    }

    registerStage(id, manager) {
        this.stages.set(id, manager);
    }

    /**
     * 특정 던전 스테이지로 진입 시도
     */
    enterStage(stageId) {
        if (!this.stages.has(stageId)) {
            Logger.error("DUNGEON_MANAGER", `Stage not found: ${stageId}`);
            return;
        }

        this.currentStageId = stageId;
        Logger.info("DUNGEON", `Entering Stage: ${stageId}`);
        
        // 씬 전환 이벤트 발생 (SceneManager가 수신)
        EventBus.emit('UI_ENTER_BATTLE', { 
            stageId: stageId 
        });
    }

    getCurrentStage() {
        return this.stages.get(this.currentStageId);
    }
}

const dungeonStageManager = new DungeonStageManager();
export default dungeonStageManager;
