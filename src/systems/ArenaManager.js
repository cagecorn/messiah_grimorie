import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';

/**
 * 아레나 매니저 (Arena Manager)
 * 역할: [라우터 (Router) & 비동기 PVP 흐름 제어]
 * 
 * 설명: 다른 유저의 데이터와 대결하는 아레나 시스템을 총괄하는 라우터입니다.
 * 매칭, 랭킹 갱신, 대전 기록 로드 등을 관리합니다.
 */
class ArenaManager {
    constructor() {
        Logger.system("ArenaManager Router: Initialized (PVP arena hub ready).");
    }

    /**
     * 대전 상대 목록 매칭 라우팅
     */
    requestMatchList() {
        Logger.info("ARENA_ROUTER", "Routing request for potential match opponents.");
    }

    /**
     * 아레나 전투 시작 라우팅
     */
    startMatch(opponentId) {
        Logger.info("ARENA_ROUTER", `Routing arena battle start against: ${opponentId}`);
        // 전투 씬 전환 및 상대 데이터 주입 라우팅
    }

    /**
     * 승패 결과 반영 및 랭킹 포인트 정산 라우팅
     */
    processMatchResult(result) {
        Logger.info("ARENA_ROUTER", `Processing arena match result: ${result.win ? 'WIN' : 'LOSS'}`);
    }
}

const arenaManager = new ArenaManager();
export default arenaManager;
