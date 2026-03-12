import Logger from '../utils/Logger.js';
import domManager from './DOMManager.js';

/**
 * DOM 그리드 매니저 (DOM Grid Manager)
 * 역할: [라우터 (Router) & 그리드 시스템 총괄]
 * 
 * 설명: 인벤토리, 상점, 스킬창 등 모든 [그리드(Grid)] 형태의 UI를 관리하는 라우터입니다.
 * 하위 그리드 모듈들에게 데이터를 배분하고, 드래그 앤 드롭 또는 슬롯 렌더링 명령을 라우팅합니다.
 */
class DOMGridManager {
    constructor() {
        this.grids = new Map();
        Logger.system("DOMGridManager Router: Initialized (Grid system hub ready).");
    }

    /**
     * 그리드 인스턴스 등록
     * @param {string} id 그리드 식별자 (e.g., 'player-inventory')
     * @param {object} gridModule 그리드 로직을 가진 하위 모듈
     */
    registerGrid(id, gridModule) {
        this.grids.set(id.toLowerCase(), gridModule);
        Logger.info("GRID_ROUTER", `Grid registered: ${id}`);
    }

    /**
     * 특정 그리드 랜더링 요청 라우팅
     * @param {string} id 
     * @param {Array} data 그리드에 채울 데이터 배열
     */
    renderGrid(id, data) {
        const grid = this.grids.get(id.toLowerCase());
        if (!grid) {
            Logger.warn("GRID_ROUTER", `Grid not found: ${id}`);
            return;
        }

        Logger.info("GRID_ROUTER", `Routing render request for grid: ${id}`);
        grid.render(data);
    }

    /**
     * 공통 그리드 레이아웃 생성 유틸리티 (DOMManager 활용)
     * 하위 그리드 모듈들이 표준화된 그리드 컨테이너를 만들 때 사용합니다.
     */
    createStandardGridContainer(id, columns, gap = '10px') {
        const container = document.createElement('div');
        container.id = id;
        container.className = 'mg-grid-container';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        container.style.gap = gap;
        
        // DOMManager를 통해 최적화 감시 대상에 등록
        domManager.registerUI(id, container);
        
        return container;
    }

    /**
     * 그리드 내 아이템 이동(Swap) 요청 라우팅
     */
    requestSwap(gridId, fromIndex, toIndex) {
        const grid = this.grids.get(gridId.toLowerCase());
        if (grid && grid.swap) {
            grid.swap(fromIndex, toIndex);
        }
    }
}

const domGridManager = new DOMGridManager();
export default domGridManager;
