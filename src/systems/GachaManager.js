import Logger from '../utils/Logger.js';
import EventBus, { EVENTS } from '../core/EventBus.js';

/**
 * 가챠 매니저 (Gacha Manager)
 * 역할: [소환 시스템 로직 라우터]
 * 
 * 설명: 소환 비용 계산, 결과 생성 요청, 씬 전환 등을 관장합니다.
 * 하드코딩된 데이터 없이 확률 매니저와 연동합니다.
 */
class GachaManager {
    constructor() {
        this.isInitialized = false;
        Logger.system("GachaManager Logic Hub: Initialized.");
    }

    initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        Logger.info("GACHA", "Gacha logic system activated.");
        
        // 여기에 초기 데이터 로드 등을 수행
    }

    /**
     * 특정 타입의 소환 시도
     * @param {string} type 'mercenary_single', 'mercenary_multi', 'pet'
     */
    attemptSummon(type) {
        Logger.info("GACHA", `Attempting summon: ${type}`);
        // [TODO] 재화 체크 및 확률 매니저 호출 로직 구현 예정
        EventBus.emit('GACHA_SUMMON_STARTED', type);
    }
}

const gachaManager = new GachaManager();
export default gachaManager;
