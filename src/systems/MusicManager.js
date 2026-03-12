import Logger from '../utils/Logger.js';

/**
 * 음반 매니저 (Music Collection Manager)
 * 역할: [라우터 & 음원 수집 데이터 허브]
 * (참고: 실제 BGM 플레이어인 AudioManager와는 별도로 '수집한 음반' 데이터를 관리함)
 */
class MusicManager {
    constructor() {
        this.unlockedDiscs = new Set();
        Logger.system("MusicCollectionManager: Initialized (Discography hub ready).");
    }

    /**
     * 음반 해금 라우팅
     */
    unlockDisc(discId) {
        this.unlockedDiscs.add(discId);
        Logger.info("MUSIC_ROUTER", `New disc unlocked: ${discId}`);
    }
}

const musicManager = new MusicManager();
export default musicManager;
