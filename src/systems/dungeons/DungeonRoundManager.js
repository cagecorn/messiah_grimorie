import Logger from '../../utils/Logger.js';
import state from '../../core/GlobalState.js';
import currencyManager from '../../core/CurrencyManager.js';
import EventBus from '../../core/EventBus.js';

/**
 * 던전 라운드 매니저 (Dungeon Round Manager)
 * 역할: [최고 기록(라운드) 관리 및 현재 진행 라운드 추적]
 */
class DungeonRoundManager {
    constructor() {
        this.records = {}; // { stageId: maxRound }
        this.currentRound = 0;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        
        // [GOD OBJECT 연동] 전역 상태에서 기록 로드
        if (!state.gameState.dungeonRecords) {
            state.gameState.dungeonRecords = {};
        }
        this.records = state.gameState.dungeonRecords;
        
        this.initialized = true;
        Logger.system("DungeonRoundManager: Records synced from GlobalState.");
    }

    /**
     * 특정 던전의 최고 기록 확인
     */
    getBestRecord(stageId) {
        return this.records[stageId] || 0;
    }

    /**
     * 새로운 기록 갱신 시도
     */
    updateRecord(stageId, round) {
        if (!this.records[stageId] || round > this.records[stageId]) {
            this.records[stageId] = round;
            state.gameState.dungeonRecords[stageId] = round; // GlobalState 동기화
            
            Logger.info("DUNGEON", `New Record for ${stageId}: Round ${round}!`);
            
            // [자동 저장] CurrencyManager의 저장 로직을 재사용하여 DB에 영구 기록
            currencyManager.saveToDB();
            
            // UI 갱신을 위해 이벤트 발생 (필요시)
            EventBus.emit('DUNGEON_RECORD_UPDATED', { stageId, round });
        }
    }

    setCurrentRound(round) {
        this.currentRound = round;
    }

    getCurrentRound() {
        return this.currentRound;
    }
}

const dungeonRoundManager = new DungeonRoundManager();
export default dungeonRoundManager;
