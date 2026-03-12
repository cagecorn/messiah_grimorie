import EventBus, { EVENTS } from './EventBus.js';
import Logger from '../utils/Logger.js';
import sceneManager from './SceneManager.js';

/**
 * 씬 전환 매니저 (Scene Transition Manager)
 * 역할: [전환 로직 통제 & 데이터 세이브 트리거]
 * 
 * 설명: 씬이 바뀔 때 발생하는 일련의 과정을 순서대로 관리합니다.
 * (이전 씬 저장 -> 페이드 아웃 -> 씬 교체 -> 페이드 인)
 */
class SceneTransitionManager {
    constructor() {
        this.isTransitioning = false;
        Logger.system("SceneTransitionManager: Initialized.");
    }

    /**
     * 안전한 씬 전환 시퀀스 시작
     * @param {string} sceneKey 
     * @param {object} data 
     */
    async startTransition(sceneKey, data = {}) {
        if (this.isTransitioning) {
            Logger.warn("TRANSITION", `Already transitioning! Ignoring request to ${sceneKey}`);
            return;
        }
        this.isTransitioning = true;

        Logger.info("TRANSITION", `[Sequence START] Target: ${sceneKey}`);

        // 1. 이벤트 발행: 전환 시작 (DOM 매니저가 페이드 아웃 시작)
        EventBus.emit(EVENTS.TRANSITION_START);
        Logger.info("TRANSITION", "Emitted TRANSITION_START");

        // 2. 데이터 저장 트리거 (God Object 및 각 시스템 데이터 백업)
        EventBus.emit(EVENTS.SAVE_DATA);
        Logger.info("TRANSITION", "Emitted SAVE_DATA");

        // 3. 연출 대기 (약간의 시간을 주어 페이드 아웃이 보기에 적당하도록 함)
        await new Promise(resolve => setTimeout(resolve, 500));

        // 4. 실제 Phaser 씬 전환
        sceneManager._executePhaserTransition(sceneKey, data);

        // 5. 전환 완료 처리 (DOM 매니저가 페이드 인)
        EventBus.emit(EVENTS.TRANSITION_COMPLETE);
        
        this.isTransitioning = false;
        Logger.info("TRANSITION", `Transition to ${sceneKey} complete.`);
    }
}

const sceneTransitionManager = new SceneTransitionManager();
export default sceneTransitionManager;
