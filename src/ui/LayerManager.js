import Logger from '../utils/Logger.js';

/**
 * 레이어 매니저 (Layer Manager)
 * 역할: [라우터 (Router)]
 * 
 * 설명: 게임 내의 모든 z-index 및 레이어 계층을 관리하는 라우터입니다.
 * UI 레이어, 전투 레이어, 배경 레이어 등 수많은 하위 레이어의 우선순위를 여기에서 중앙 통제합니다.
 */
class LayerManager {
    constructor() {
        // [구역 1] 레이어 정의 (z-index 표준)
        this.layers = {
            background: 0,
            world: 100,
            entities: 500,
            fx: 800,
            hud: 1000,
            popup: 15000,
            tooltip: 18000,
            nav: 20001
        };
        
        Logger.system("LayerManager Router: Initialized.");
    }

    /**
     * 특정 레이어의 z-index 값을 반환합니다.
     */
    getDepth(layerName) {
        return this.layers[layerName] || 0;
    }

    /**
     * 특정 객체를 지정된 레이어 위로 배치하도록 라우팅합니다.
     */
    assignToLayer(object, layerName) {
        if (object && object.setDepth) {
            object.setDepth(this.getDepth(layerName));
        } else {
            Logger.warn("LAYER_ROUTER", `Cannot assign depth to object in layer: ${layerName}`);
        }
    }
}

const layerManager = new LayerManager();
export default layerManager;
