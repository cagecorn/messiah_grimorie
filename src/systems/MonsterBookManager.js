import Logger from '../utils/Logger.js';

/**
 * 몬스터 도감 매니저 (Monster Book Manager)
 * 역할: [라우터 & 몬스터 데이터 아카이브]
 */
class MonsterBookManager {
    constructor() {
        this.killCounts = new Map();
        Logger.system("MonsterBookManager: Initialized (Bestiary hub ready).");
    }

    /**
     * 처치 기록 라우팅
     */
    recordKill(monsterId) {
        const current = this.killCounts.get(monsterId) || 0;
        this.killCounts.set(monsterId, current + 1);
        Logger.info("BESTIARY_ROUTER", `Kill recorded: ${monsterId} (${current + 1})`);
    }

    /**
     * 몬스터 정보 해금 상태 확인 라우팅
     */
    isInfoUnlocked(monsterId, level) {
        Logger.info("BESTIARY_ROUTER", `Checking unlock status for ${monsterId} at level ${level}`);
        return false;
    }
}

const monsterBookManager = new MonsterBookManager();
export default monsterBookManager;
