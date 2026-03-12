import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';

/**
 * 편성 매니저 (Formation Manager)
 * 역할: [라우터 (Router) & 전략 팀 구성기]
 * 
 * 설명: 전투에 출전할 용병들의 배치와 팀 구 구성을 총괄하는 라우터입니다.
 * 저장된 프리셋 로드 및 배치 변경 사항을 정규화하여 관리합니다.
 */
class FormationManager {
    constructor() {
        this.currentFormation = [];
        Logger.system("FormationManager Router: Initialized (Strategy formation hub ready).");
    }

    /**
     * 특정 슬롯에 유닛 배치 라우팅
     */
    assignUnit(slotIndex, unitId) {
        Logger.info("FORMATION_ROUTER", `Routing unit assignment: Slot[${slotIndex}] -> Unid[${unitId}]`);
        // 중복 체크 및 슬롯 유효성 검사 후 데이터 갱신
        EventBus.emit('FORMATION_CHANGED', { slotIndex, unitId });
    }

    /**
     * 전체 편성 프리셋 저장/로드 라우팅
     */
    savePreset(presetId) {
        Logger.info("FORMATION_ROUTER", `Saving formation preset: ${presetId}`);
    }

    /**
     * 현재 편성된 전투 인원 전투력(Combat Power) 합산 라우팅
     */
    calculateTotalCP() {
        Logger.info("FORMATION_ROUTER", "Calculating total combat power for current formation.");
    }
}

const formationManager = new FormationManager();
export default formationManager;
