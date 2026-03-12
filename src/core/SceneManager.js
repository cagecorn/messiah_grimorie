import EventBus, { EVENTS } from './EventBus.js';
import Logger from '../utils/Logger.js';

/**
 * 씬 매니저 (Scene Manager)
 * 역할: [라우터 (Router) & 흐름 통제관]
 * 
 * 설명: 게임의 전체적인 장면 전환(Transition)과 흐름을 관리하는 라우터입니다.
 * 단순히 씬을 바꾸는 것을 넘어, 장면 전환 시 필요한 데이터 저장, 매니저 초기화, 
 * 페이드 인/아웃 효과 등을 총괄하여 라우팅합니다.
 */
class SceneManager {
    constructor() {
        this.game = null;
        this.currentScene = null;
        this.previousScene = null;

        Logger.system("SceneManager Router: Initialized (Game flow hub ready).");
    }

    /**
     * Phaser 게임 인스턴스 연동
     */
    initialize(game) {
        this.game = game;
    }

    /**
     * 특정 씬으로 전환 요청 라우팅
     * @param {string} sceneKey 전환할 씬의 키값
     * @param {object} data 전달할 데이터
     */
    transitionTo(sceneKey, data = {}) {
        if (!this.game) {
            Logger.error("SCENE_ROUTER", "Game instance not initialized in SceneManager.");
            return;
        }

        const scene = this.game.scene;
        const currentActive = this.getActiveScene();

        Logger.info("SCENE_ROUTER", `Routing transition: ${currentActive ? currentActive.scene.key : 'None'} -> ${sceneKey}`);

        // 1. 이전 씬 정보 기록
        if (currentActive) {
            this.previousScene = currentActive.scene.key;
            // 씬 종료 전 공통 처리 (데이터 저장 신호 등) 라우팅
            EventBus.emit(EVENTS.SAVE_DATA);
        }

        // 2. 씬 전환 실행 및 데이터 전달
        scene.start(sceneKey, data);
        this.currentScene = sceneKey;

        // 3. 전역 이벤트 발행 (다른 매니저들이 씬 변화에 대응하도록)
        EventBus.emit(EVENTS.SCENE_CHANGED, sceneKey);
    }

    /**
     * 현재 활성화된 Phaser 씬 객체 반환
     */
    getActiveScene() {
        if (!this.game) return null;
        return this.game.scene.getScenes(true)[0];
    }

    /**
     * 씬 일시 정지/재개 라우팅
     */
    pauseScene(sceneKey) {
        this.game.scene.pause(sceneKey);
        Logger.info("SCENE_ROUTER", `Scene paused: ${sceneKey}`);
    }

    resumeScene(sceneKey) {
        this.game.scene.resume(sceneKey);
        Logger.info("SCENE_ROUTER", `Scene resumed: ${sceneKey}`);
    }

    /**
     * 특정 씬이 실행 중인지 확인
     */
    isActive(sceneKey) {
        return this.game.scene.isActive(sceneKey);
    }
}

const sceneManager = new SceneManager();
export default sceneManager;
