import Logger from '../utils/Logger.js';

/**
 * 캔버스 매니저 (Canvas Manager)
 * 역할: [라우터 (Router) & 렌더링 배분기]
 * 
 * 설명: Phaser의 메인 캔버스(Canvas) 위에 그려지는 순수 그래픽 요소들을 관리하는 라우터입니다.
 * 파티클 시스템, 특수 이펙트, 커스텀 드로잉 등을 담당하는 하위 캔버스 모듈들로 명령을 분류하여 보냅니다.
 */
class CanvasManager {
    constructor() {
        this.canvasModules = new Map();
        Logger.system("CanvasManager Router: Initialized (Canvas rendering hub ready).");
    }

    /**
     * 하위 캔버스 모듈 등록 (예: FXModule, ParticleModule 등)
     * @param {string} id 
     * @param {object} module 
     */
    register(id, module) {
        this.canvasModules.set(id.toLowerCase(), module);
        Logger.info("CANVAS_ROUTER", `Canvas Module registered: ${id}`);
    }

    /**
     * 특정 렌더링 요청을 하위 모듈로 라우팅
     * @param {string} moduleId 
     * @param {string} action 
     * @param {object} params 
     */
    draw(moduleId, action, params) {
        const module = this.canvasModules.get(moduleId.toLowerCase());
        if (module && typeof module[action] === 'function') {
            module[action](params);
        } else {
            Logger.warn("CANVAS_ROUTER", `Drawing routing failed: ${moduleId} -> ${action}`);
        }
    }

    /**
     * 모든 하위 캔버스 모듈 일괄 갱신
     */
    updateAll(time, delta) {
        this.canvasModules.forEach((module, id) => {
            if (typeof module.update === 'function') {
                module.update(time, delta);
            }
        });
    }

    /**
     * 특정 장면 전환 시 캔버스 자원 정리 라우팅
     */
    clearAll() {
        Logger.info("CANVAS_ROUTER", "Clearing all canvas routing modules.");
        this.canvasModules.forEach(module => {
            if (typeof module.clear === 'function') module.clear();
        });
    }
}

const canvasManager = new CanvasManager();
export default canvasManager;
