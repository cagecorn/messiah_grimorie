import Logger from '../utils/Logger.js';
import domManager from './DOMManager.js';
import EventBus, { EVENTS } from '../core/EventBus.js';

/**
 * 씬 전환 DOM 매니저 (Scene Transition DOM Manager)
 * 역할: [시각적 전환 효과 (Fade In/Out) 담당]
 */
class SceneTransitionDOMManager {
    constructor() {
        this.overlay = null;
        Logger.system("SceneTransitionDOMManager: Initialized.");
    }

    initialize() {
        if (this.overlay) return;

        this.overlay = document.createElement('div');
        this.overlay.className = 'mg-transition-overlay';
        
        // 초기 상태는 보이지 않음
        domManager.addToLayer('toast', this.overlay); // 최상위 레이어(toast) 사용
        
        // addToLayer 이후 다시 한번 확실히 차단 해제 (초기 상태)
        this.overlay.style.pointerEvents = 'none';
        this.overlay.style.opacity = '0';

        this.setupListeners();
    }

    setupListeners() {
        EventBus.on(EVENTS.TRANSITION_START, () => this.fadeOut());
        EventBus.on(EVENTS.TRANSITION_COMPLETE, () => this.fadeIn());
    }

    /**
     * 화면을 어둡게 (씬 전환 전)
     */
    fadeOut() {
        if (!this.overlay) return;
        Logger.info("TRANSITION_UI", "Fading out...");
        this.overlay.style.pointerEvents = 'auto';
        this.overlay.style.opacity = '1';
    }

    /**
     * 화면을 밝게 (씬 전환 후)
     */
    fadeIn() {
        if (!this.overlay) return;
        Logger.info("TRANSITION_UI", "Fading in...");
        
        // 씬 로딩 여유를 위해 약간 지연 후 페이드 인
        setTimeout(() => {
            this.overlay.style.opacity = '0';
            this.overlay.style.pointerEvents = 'none';
        }, 300);
    }
}

const sceneTransitionDOMManager = new SceneTransitionDOMManager();
export default sceneTransitionDOMManager;
