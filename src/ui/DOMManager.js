import Logger from '../utils/Logger.js';

/**
 * DOM 매니저 (DOM Manager)
 * 역할: [라우터 (Router) & 최적화 감시자]
 * 
 * 설명: Phaser의 상단에 띄워지는 HTML DOM 요소들을 통합 관리하는 라우터입니다.
 * [더티 플래그(Dirty Flag) 최적화]를 강제하며, 이를 어기는 하위 모듈 발견 시 강력하게 경고합니다.
 */
class DOMManager {
    constructor() {
        this.domModules = new Map();
        Logger.system("DOMManager Router: Initialized (Dirty Flag monitoring active).");
    }

    /**
     * 하위 DOM 모듈 등록
     * @param {string} id 
     * @param {object} module { update: function, isDirty: boolean/function }
     */
    register(id, module) {
        this.domModules.set(id, module);
        Logger.info("DOM_ROUTER", `DOM Module registered: ${id}`);
    }

    /**
     * 모든 DOM 모듈 업데이트 라우팅
     * @param {object} globalData 현재 게임 상태 데이터
     */
    updateAll(globalData) {
        this.domModules.forEach((module, id) => {
            // [더티 플래그 최적화] 검증
            if (typeof module.isDirty !== 'boolean' && typeof module.isDirty !== 'function') {
                Logger.error("PERFORMANCE_CRITICAL", 
                    `[${id}] DOM 모듈에 'isDirty' 플래그가 없습니다! 매 프레임 DOM 접근은 성능에 치명적입니다.`
                );
                return;
            }

            const dirty = (typeof module.isDirty === 'function') ? module.isDirty(globalData) : module.isDirty;

            if (dirty) {
                // 데이터가 변경되었을 때만 실제 DOM 조작(Update) 수행
                module.update(globalData);
            }
        });
    }

    /**
     * 특정 요소 강제 업데이트
     */
    forceUpdate(id, data) {
        const module = this.domModules.get(id);
        if (module) {
            Logger.info("DOM_ROUTER", `Force updating DOM: ${id}`);
            module.update(data);
        }
    }
}

const domManager = new DOMManager();
export default domManager;
