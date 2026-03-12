import Logger from '../utils/Logger.js';

/**
 * 캔버스 오프스크린 매니저 (Canvas Offscreen Manager)
 * 역할: [라우터 (Router) & 고해상도 렌더링 서버]
 * 
 * 설명: 텍스트, 체력바, 아이콘 등 선명도가 중요한 요소를 위한 슈퍼 샘플링 매니저입니다.
 * 1. 투명 오프스크린 캔버스 생성/제공
 * 2. 2배 크기로 렌더링 (Super-sampling)
 * 3. 최종 출력 시 다시 절반으로 축소하여 '망막 디스플레이'급 선명도 유지
 */
class CanvasOffscreenManager {
    constructor() {
        this.subModules = new Map();
        this.upscaleFactor = 2.0; // 선명도를 위한 확대 배율
        
        Logger.system("CanvasOffscreenManager: Initialized (Super-sampling ready).");
    }

    /**
     * 하위 요소 등록 (예: HighResText, SmoothHealthBar 등)
     * @param {string} id 
     * @param {object} module 
     */
    register(id, module) {
        this.subModules.set(id.toLowerCase(), module);
        Logger.info("OFFSCREEN_ROUTER", `High-res module registered: ${id}`);
    }

    /**
     * 고해상도 텐더링 요청 라우팅
     * @param {string} moduleId 
     * @param {string} action 
     * @param {object} params 
     */
    requestHighResRender(moduleId, action, params) {
        const module = this.subModules.get(moduleId.toLowerCase());
        if (module && typeof module[action] === 'function') {
            // 확대 배율을 적용한 파라미터 전달
            const upscaledParams = {
                ...params,
                scale: (params.scale || 1.0) * this.upscaleFactor,
                resolution: this.upscaleFactor
            };
            
            return module[action](upscaledParams);
        } else {
            Logger.warn("OFFSCREEN_ROUTER", `High-res routing failed: ${moduleId} -> ${action}`);
            return null;
        }
    }

    /**
     * 오프스크린 캔버스 유틸리티: 대상의 2배 크기 버퍼 생성
     * 자식 모듈들이 이 메서드를 통해 버퍼를 할당받음
     */
    createBuffer(width, height) {
        const buffer = document.createElement('canvas');
        buffer.width = width * this.upscaleFactor;
        buffer.height = height * this.upscaleFactor;
        return {
            canvas: buffer,
            ctx: buffer.getContext('2d'),
            displayScale: 1 / this.upscaleFactor
        };
    }
}

const canvasOffscreenManager = new CanvasOffscreenManager();
export default canvasOffscreenManager;
