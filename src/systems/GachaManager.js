import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';

/**
 * 가챠 매니저 (Gacha Manager)
 * 역할: [라우터 (Router) & 소환 로직 제어기]
 * 
 * 설명: 용병 및 아이템 소환(가챠) 기능을 총괄하는 라우터입니다.
 * 확률 테이블 기반의 결과 생성 및 연출 신호를 라우팅합니다.
 */
class GachaManager {
    constructor() {
        Logger.system("GachaManager Router: Initialized (Summoning system ready).");
    }

    /**
     * 소환 실행 요청 라우팅
     * @param {string} bannerId 소환 배너 ID
     * @param {number} count 소환 횟수 (1회, 10회 등)
     */
    requestSummon(bannerId, count) {
        Logger.info("GACHA_ROUTER", `Routing summon request: Banner[${bannerId}] x${count}`);
        // 1. 재화 확인 라우팅
        // 2. 확률 테이블 기반 결과 생성 라우팅
        // 3. 연출(Cutscene) 시작 이벤트 발행
    }

    /**
     * 획득 결과 정산 및 저장 라우팅
     */
    processResults(results) {
        Logger.info("GACHA_ROUTER", "Processing and saving summon results.");
        EventBus.emit('GACHA_RESULTS_PROCESSED', results);
    }
}

const gachaManager = new GachaManager();
export default gachaManager;
