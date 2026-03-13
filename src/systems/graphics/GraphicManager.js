import Logger from '../../utils/Logger.js';

/**
 * 그래픽 매니저 (Graphic Manager)
 * 역할: [전체 시각 효과 컨트롤 타워]
 */
class GraphicManager {
    constructor() {
        this.subManagers = {};
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // [Phaser FX]
            const [bloom, motes, trails] = await Promise.all([
                import('./BloomManager.js'),
                import('./MotesManager.js'),
                import('./TrailManager.js')
            ]);

            // [DOM FX]
            const [vignette, tilt, grading, filter, texture, blur, chromatic] = await Promise.all([
                import('./VignetteManager.js'),
                import('./TiltShiftManager.js'),
                import('./ColorGradingManager.js'),
                import('./GraphicFilterManager.js'),
                import('./GraphicTextureManager.js'),
                import('./BlurManager.js'),
                import('./ChromaticAberrationManager.js')
            ]);

            this.subManagers = {
                bloom: bloom.default,
                motes: motes.default,
                trails: trails.default,
                vignette: vignette.default,
                tilt: tilt.default,
                grading: grading.default,
                filter: filter.default,
                texture: texture.default,
                blur: blur.default,
                chromatic: chromatic.default
            };

            this.isInitialized = true;
            Logger.system("GraphicManager: All 8 FX modules loaded.");
        } catch (error) {
            Logger.error("GRAPHICS", `Initialization failed: ${error.message}`);
        }
    }

    /**
     * 특정 씬 진입 시 효과 적용
     */
    applySceneFX(scene) {
        if (!this.isInitialized) return;
        
        // Phaser 기반 효과 초기화 (씬 객체 필요)
        if (this.subManagers.bloom) this.subManagers.bloom.init(scene);
        if (this.subManagers.motes) this.subManagers.motes.init(scene);
        if (this.subManagers.trails) this.subManagers.trails.init(scene);
        
        Logger.info("GRAPHICS", `Applied visual atmosphere to ${scene.scene.key}`);
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
