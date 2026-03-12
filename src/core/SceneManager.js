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

        // UI 이벤트 리스너 등록
        EventBus.on('UI_OPEN_GACHA', () => {
            Logger.info("SCENE_ROUTER", "Received event: UI_OPEN_GACHA");
            this.transitionTo('GachaScene');
        });

        EventBus.on('UI_OPEN_TERRITORY', () => {
            Logger.info("SCENE_ROUTER", "Received event: UI_OPEN_TERRITORY");
            this.transitionTo('TerritoryScene');
        });

        EventBus.on('UI_OPEN_FORMATION', () => {
            Logger.info("SCENE_ROUTER", "Received event: UI_OPEN_FORMATION");
            this.transitionTo('FormationScene');
        });

        EventBus.on('UI_ENTER_BATTLE', (data) => {
            Logger.info("SCENE_ROUTER", "Received event: UI_ENTER_BATTLE");
            this.transitionTo('BattleScene', data);
        });
    }

    /**
     * 특정 씬으로 전환 요청 라우팅 (전환 매니저를 통한 시퀀스 실행)
     * @param {string} sceneKey 전환할 씬의 키값
     * @param {object} data 전달할 데이터
     */
    transitionTo(sceneKey, data = {}) {
        Logger.info("SCENE_ROUTER", `[transitionTo] Requesting transition to: ${sceneKey}`);
        import('./SceneTransitionManager.js').then(module => {
            if (!module.default) {
                Logger.error("SCENE_ROUTER", "SceneTransitionManager module not found or no default export.");
                return;
            }
            module.default.startTransition(sceneKey, data);
        }).catch(err => {
            Logger.error("SCENE_ROUTER", `Failed to load SceneTransitionManager: ${err.message}`);
        });
    }

    /**
     * 실제 물리적 씬 전환 (TransitionManager가 호출함)
     */
    _executePhaserTransition(sceneKey, data = {}) {
        if (!this.game) {
            Logger.error("SCENE_ROUTER", "Cannot execute transition: game instance is NULL.");
            return;
        }

        const scene = this.game.scene;
        const currentActive = this.getActiveScene();

        Logger.info("SCENE_ROUTER", `[Phaser] Executing transition: ${sceneKey}`);

        if (currentActive) {
            this.previousScene = currentActive.scene.key;
            Logger.info("SCENE_ROUTER", `Stopping current scene: ${this.previousScene}`);
            this.game.scene.stop(this.previousScene);
        }

        scene.start(sceneKey, data);
        this.currentScene = sceneKey;

        // 전역 이벤트 발행
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
