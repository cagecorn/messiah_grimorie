import Logger from '../utils/Logger.js';
import EventBus, { EVENTS } from './EventBus.js';
import state from './GlobalState.js';
import indexDBManager from './IndexDBManager.js';

/**
 * 세이브 매니저 (Save Manager)
 * 역할: [로직 레이어 (Logic Layer) & 데이터 직렬화기]
 * 
 * 설명: 인덱스DB 매니저가 '저장소 그 자체'라면, 세이브 매니저는 '언제, 무엇을 저장할지' 결정하는 전략가입니다.
 * 1. 게임 내 모든 매니저의 최신 상태(GlobalState)를 수집.
 * 2. 특정 시점(자동 저장, 장면 전환, 수동 저장)에 저장을 실행.
 * 3. 인덱스DB 매니저를 호출하여 데이터를 하드웨어에 기록.
 */
class SaveManager {
    constructor() {
        this.saveKey = 'messiah_grimorie_save';
        this.autoSaveInterval = 60000; // 1분마다 자동 저장
        this.timer = null;

        this.setupListeners();
        Logger.system("SaveManager: Initialized (Persistence strategy ready).");
    }

    setupListeners() {
        // 전역 저장 이벤트 구독
        EventBus.on(EVENTS.SAVE_DATA, (specificData) => {
            this.saveGame(specificData);
        });
    }

    /**
     * 자동 저장 시작
     */
    startAutoSave() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            Logger.info("SAVE_SYSTEM", "Triggering periodic auto-save.");
            this.saveGame();
        }, this.autoSaveInterval);
    }

    /**
     * 게임 데이터 저장 실행
     * @param {object} specificData 특정 데이터만 업데이트하고 싶을 때 사용
     */
    async saveGame(specificData = null) {
        Logger.info("SAVE_SYSTEM", "Starting serialization process...");

        // 1. 특정 데이터가 들어왔다면 GlobalState에 병합 (선택 사항)
        if (specificData) {
            Object.assign(state, specificData);
        }

        // 2. 현재 GlobalState 직렬화 (불필요한 참조 제거 등)
        const dataToSave = JSON.parse(JSON.stringify(state));

        // 3. 인덱스DB 매니저(라우터)를 통해 실제 저장소에 기록
        try {
            await indexDBManager.save(this.saveKey, dataToSave);
            Logger.info("SAVE_SYSTEM", "Game data successfully synced to IndexedDB.");
            EventBus.emit('SAVE_COMPLETED');
        } catch (error) {
            Logger.error("SAVE_SYSTEM", `Save failed: ${error.message}`);
        }
    }

    /**
     * 게임 데이터 로드 연동
     */
    async loadGame() {
        Logger.info("SAVE_SYSTEM", "Attempting to load save data...");
        try {
            const loadedData = await indexDBManager.load(this.saveKey);
            if (loadedData) {
                Object.assign(state, loadedData);
                Logger.info("SAVE_SYSTEM", "Save data restored to GlobalState.");
                EventBus.emit(EVENTS.LOAD_DATA, state);
                return true;
            }
        } catch (error) {
            Logger.error("SAVE_SYSTEM", `Load failed: ${error.message}`);
        }
        return false;
    }
}

const saveManager = new SaveManager();
export default saveManager;
