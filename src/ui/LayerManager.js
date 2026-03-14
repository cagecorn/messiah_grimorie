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
        /**
         * [표준 z-index 계층 (Standard Z-Index Hierarchy)]
         * 
         * 20001: 내비게이션 바 (NAV - #mobile-hud) - 최상위 메뉴.
         * 18000: 상세 툴팁 (TOOLTIP - .status-popup-tab) - 버프/디버프 정보.
         * 15000: 팝업 레이어 (POPUP - #popup-overlay) - 용병 상세창, 설정 등.
         * 1000:  일반 HUD (HUD - #hud-round-display, #hud-bottom)
         * 500:   전투 HUD (WORLD_UI - #npc-hud, #messiah-hud) - 월드 내 유닛 정보.
         * 100:   엔티티 (ENTITIES) - 캐릭터, 오브젝트.
         * 10:    그림자 (SHADOW) - 유닛 발밑 그림자.
         * 0:     배경 (BACKGROUND) - 맵, 타일.
         * 
         * [구조적 제약 (Structural Constraints)]:
         * - #npc-hud 및 #messiah-hud는 반드시 #mobile-hud 외부(app-container의 직계 자식)에
         *   위치해야 독립적인 레이어 순서가 보장됩니다.
         */
        this.layers = {
            background: 0,
            shadow: 10,
            world: 100,
            entities: 100,
            world_ui: 500, // #npc-hud, #messiah-hud
            fx: 800,
            hud: 1000,
            ui: 15000, // [신규] 인벤토리 등 대형 UI 레이어
            popup: 15000,
            graphics_fx: 19000, // [신규] 화면 전체 그래픽 효과 레이어
            tooltip: 18000,
            nav: 20001,
            toast: 25000 // 최상단 (전환 효과 등)
        };
        
        Logger.system("LayerManager Router: Z-Index hierarchy standardized.");
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
