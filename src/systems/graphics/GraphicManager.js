import Logger from '../../utils/Logger.js';
import EventBus, { EVENTS } from '../../core/EventBus.js';

/**
 * 그래픽 매니저 (Graphic Manager)
 * 역할: [전체 시각 효과 컨트롤 타워]
 */
class GraphicManager {
    constructor() {
        this.subManagers = {};
        this.isInitialized = false;
        
        // 씬 전환 시 자동 청소/적용 연동
        EventBus.on(EVENTS.SCENE_CHANGED, (sceneKey) => {
            this.handleSceneChange(sceneKey);
        });
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // [Phaser FX]
            const [bloom, trails] = await Promise.all([
                import('./BloomManager.js'),
                import('./TrailManager.js')
            ]);

            // [DOM FX]
            const [vignette, grading, filter, texture, blur, chromatic] = await Promise.all([
                import('./VignetteManager.js'),
                import('./ColorGradingManager.js'),
                import('./GraphicFilterManager.js'),
                import('./GraphicTextureManager.js'),
                import('./BlurManager.js'),
                import('./ChromaticAberrationManager.js')
            ]);

            this.subManagers = {
                bloom: bloom.default,
                trails: trails.default,
                vignette: vignette.default,
                grading: grading.default,
                filter: filter.default,
                texture: texture.default,
                blur: blur.default,
                chromatic: chromatic.default
            };

            this.isInitialized = true;
            Logger.system("GraphicManager: Visual FX modules loaded.");
        } catch (error) {
            Logger.error("GRAPHICS", `Initialization failed: ${error.message}`);
        }
    }

    /**
     * 씬 전환 시 효과 자동 처리
     */
    handleSceneChange(sceneKey) {
        if (!this.isInitialized) return;
        
        // 1. 기존 모든 효과 레이어 초기화 (CLEAN SLATE)
        this.clearDOMFX();

        // 2. 특정 씬에만 필요한 효과 활성화 (PRESETS)
        if (sceneKey === 'BattleScene') {
            this.applyBattleFX();
        } else {
            this.applyUIFX();
        }
    }

    /**
     * 모든 DOM 기반 효과 숨김 (display: none)
     */
    clearDOMFX() {
        const domFX = ['vignette', 'grading', 'filter', 'texture', 'blur', 'chromatic'];
        domFX.forEach(type => {
            if (this.subManagers[type] && this.subManagers[type].setEnabled) {
                this.subManagers[type].setEnabled(false);
            }
        });
        Logger.info("GRAPHICS", "Clear all atmosphere layers.");
    }

    /**
     * 전투 씬용 강렬한 효과 프리셋
     */
    applyBattleFX() {
        // 전투 시에는 모든 효과를 사용하여 몰입감 극대화
        // [REFINE] 현재 유저가 수동으로 해제한 상태에서도 다시 켜지는 문제가 있어 주석 처리
        /*
        const domFX = ['vignette', 'grading', 'filter', 'texture', 'blur', 'chromatic'];
        domFX.forEach(type => {
            if (this.subManagers[type] && this.subManagers[type].setEnabled) {
                this.subManagers[type].setEnabled(true);
            }
        });
        */
        
        Logger.info("GRAPHICS", "Battle FX Preset initialized (Filters state maintained).");
    }

    /**
     * 메뉴/UI 씬용 깔끔한 효과 프리셋
     */
    applyUIFX() {
        // UI 씬(편성 등)에서는 가독성을 위해 비네팅 정도만 아주 은은하게 유지
        if (this.subManagers.vignette && this.subManagers.vignette.setEnabled) {
            this.subManagers.vignette.setEnabled(true);
        }
        
        Logger.info("GRAPHICS", "UI FX Preset applied (Clean View).");
    }

    /**
     * 수동 효과 적용 (기존 코드 호환용)
     */
    applySceneFX(scene) {
        this.handleSceneChange(scene.scene.key);
    }

    /**
     * 효과 강도 조절 (예: 설정 메뉴 연동용)
     */
    setEffectEnabled(type, enabled) {
        if (this.subManagers[type]) {
            this.subManagers[type].setEnabled(enabled);
        }
    }
}

const graphicManager = new GraphicManager();
export default graphicManager;
