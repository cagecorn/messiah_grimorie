import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';

/**
 * 던전 매니저 (Dungeon Manager)
 * 역할: [라우터 (Router) & 던전 흐름 제어기]
 * 
 * 설명: 던전 입장, 진행 상태, 승리/패배 조건, 보상 연산 등을 총괄하는 라우터입니다.
 * 각 던전의 특수 기믹이나 스테이지 데이터를 하위 데이터 모듈로 배분합니다.
 */
class DungeonManager {
    constructor() {
        this.currentDungeon = null;
        this.stage = 0;
        this.isCleared = false;
        
        Logger.system("DungeonManager Router: Initialized (Stage flow control ready).");
    }

    /**
     * 던전 입장 라우팅
     * @param {string} dungeonId 
     */
    enterDungeon(dungeonId) {
        Logger.info("DUNGEON_ROUTER", `Entering dungeon: ${dungeonId}`);
        this.currentDungeon = dungeonId;
        this.stage = 1;
        this.isCleared = false;
        
        EventBus.emit('DUNGEON_ENTERED', { dungeonId });
    }

    /**
     * 스테이지 진행 라우팅
     */
    nextStage() {
        this.stage++;
        Logger.info("DUNGEON_ROUTER", `Stage advanced: ${this.stage}`);
        EventBus.emit('DUNGEON_STAGE_CHANGED', { stage: this.stage });
    }

    /**
     * 결과 정산 라우팅
     */
    finish(success) {
        this.isCleared = success;
        Logger.info("DUNGEON_ROUTER", `Dungeon finished. Status: ${success ? 'CLEARED' : 'FAILED'}`);
        EventBus.emit('DUNGEON_FINISHED', { success, dungeonId: this.currentDungeon });
    }
}

const dungeonManager = new DungeonManager();
export default dungeonManager;
