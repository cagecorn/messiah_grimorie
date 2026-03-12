import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';

/**
 * 레이드 매니저 (Raid Manager)
 * 역할: [라우터 (Router) & 거대 보스 전투 제어]
 * 
 * 설명: 강력한 단일 보스를 상대하는 레이드 콘텐츠를 총괄하는 라우터입니다.
 * 보스 페이즈 전환, 누적 대미지 랭킹, 레이드 기간 관리 등을 담당합니다.
 */
class RaidManager {
    constructor() {
        Logger.system("RaidManager Router: Initialized (Epic boss hub ready).");
    }

    /**
     * 현재 활성화된 레이드 보스 정보 요청 라우팅
     */
    getActiveRaid() {
        Logger.info("RAID_ROUTER", "Routing request for active raid boss information.");
    }

    /**
     * 레이드 전투 입장 라우팅
     */
    enterRaid(bossId) {
        Logger.info("RAID_ROUTER", `Routing entry to Raid Boss: ${bossId}`);
    }

    /**
     * 누적 대미지 및 보상 정산 라우팅
     */
    updateAccumulatedDamage(damage) {
        Logger.info("RAID_ROUTER", `Routing raid damage update: ${damage}`);
    }
}

const raidManager = new RaidManager();
export default raidManager;
