import Logger from '../../utils/Logger.js';
import state from '../../core/GlobalState.js';

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
        
        // [TODO] SaveManager/GlobalState에서 최고 기록 로드
        // 임시 더미 데이터 (테스트용)
        this.records = {
            'cursed_forest': 0,
            'undead_graveyard': 2,
            'swampland': 0
        };

        this.initialized = true;
        Logger.system("DungeonRoundManager: Records loaded.");
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
            Logger.info("DUNGEON", `New Record for ${stageId}: Round ${round}!`);
            // [TODO] Persistence 저장 호출
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
