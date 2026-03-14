import EventBus, { EVENTS } from '../core/EventBus.js';
import Logger from '../utils/Logger.js';
import formationDOMManager from './formation/FormationDOMManager.js';
import sceneTransitionDOMManager from './SceneTransitionDOMManager.js';
import characterInfoDOMManager from './CharacterInfoDOMManager.js';
import quickActionDOMManager from './QuickActionDOMManager.js';

/**
 * UI 매니저 (UI Manager)
 * 역할: [라우터 (Router)]
 * 
 * 설명: 이 클래스는 모든 UI 관련 요청을 수신하고 하위 UI 모듈(예: InventoryUI, SettingsUI 등)로
 * 데이터를 전달하는 최상위 허브입니다. 직접적인 UI 로직보다는 분류와 분배를 담당합니다.
 */
class UIManager {
    constructor() {
        this.subModules = new Map(); // 하위 UI 모듈들을 관리하는 저장소
        this.initialize();
    }

    initialize() {
        Logger.system("UIManager Router: Initialized.");
        
        // 시각적 전환 매니저 초기화
        sceneTransitionDOMManager.initialize();
        
        // 하위 모듈 등록
        this.registerSubModule('formation', formationDOMManager);
        this.registerSubModule('character_info', characterInfoDOMManager);
        this.registerSubModule('quick_action', quickActionDOMManager);
        
        // 공통 UI 이벤트 리스너 등록
        EventBus.on(EVENTS.SCENE_CHANGED, (scene) => this.routeSceneUI(scene));
    }

    /**
     * 하위 UI 모듈 등록
     * @param {string} name 
     * @param {object} module 
     */
    registerSubModule(name, module) {
        this.subModules.set(name.toLowerCase(), module);
        Logger.info("UI_ROUTER", `Sub-module registered: ${name}`);
    }

    /**
     * 특정 UI 모듈로 요청 전달
     */
    route(moduleName, action, data) {
        const module = this.subModules.get(moduleName.toLowerCase());
        if (module && typeof module[action] === 'function') {
            module[action](data);
        } else {
            Logger.warn("UI_ROUTER", `Routing failed: ${moduleName} -> ${action}`);
        }
    }

    routeSceneUI(scene) {
        Logger.info("UI_ROUTER", `Routing UI for scene: ${scene}`);
        // 장면에 따른 UI 레이아웃 전환 로직
    }
}

const uiManager = new UIManager();
export default uiManager;
