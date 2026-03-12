import Logger from '../utils/Logger.js';

/**
 * 패치 노트 매니저 (Patch Note Manager)
 * 역할: [라우터 & 업데이트 정보 배분]
 */
class PatchNoteManager {
    constructor() {
        Logger.system("PatchNoteManager: Initialized (Journal hub ready).");
    }

    /**
     * 최신 패치 정보 로드 라우팅
     */
    fetchLatestNotes() {
        Logger.info("PATCH_ROUTER", "Routing request for latest patch information.");
        return [];
    }
}

const patchNoteManager = new PatchNoteManager();
export default patchNoteManager;
