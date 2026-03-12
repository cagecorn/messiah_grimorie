import Logger from '../utils/Logger.js';

/**
 * 그래픽 매니저 (Graphics Manager)
 * 역할: [라우터 (Router) & 포스트 프로세싱 허브]
 * 
 * 설명: 게임의 전반적인 비주얼 톤을 결정하는 라우터입니다.
 * 하위 모듈인 [FilterManager]를 통해 전역 필터(그레이스케일, 세피아, 야간 필터 등)를 제어합니다.
 */
class GraphicsManager {
    constructor() {
        this.filterManager = {
            activeFilters: new Set(),
            // 전역 필터 적용 로직 (하위 요소)
            applyGlobalFilter: (filterName) => {
                Logger.info("GRAPHICS_ROUTER", `Global filter applied: ${filterName}`);
                // [TODO] Shader 및 PostFX Pipeline 연동
            }
        };

        Logger.system("GraphicsManager Router: Initialized (Filter hub ready).");
    }

    /**
     * 필터 명령 라우팅
     */
    setFilter(filterName) {
        this.filterManager.applyGlobalFilter(filterName);
    }

    /**
     * 그래픽 품질 설정 라우팅
     */
    setQuality(level) {
        Logger.info("GRAPHICS_ROUTER", `Graphics quality set to: ${level}`);
        // [TODO] Particle 밀도, 텍스처 해상도 등 조절 명령 전파
    }
}

const graphicsManager = new GraphicsManager();
export default graphicsManager;
