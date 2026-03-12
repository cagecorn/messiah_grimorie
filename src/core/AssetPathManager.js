import Logger from '../utils/Logger.js';

/**
 * 에셋 경로 매니저 (Asset Path Manager)
 * 역할: [중앙 경로 저장소]
 * 
 * 설명: 게임 내 모든 이미지, 사운드, JSON 데이터의 경로를 한곳에서 관리합니다.
 * 에셋 라이브러리 역할을 하며, 실제 파일 구조가 변경되어도 이곳의 경로만 수정하면 됩니다.
 */
class AssetPathManager {
    constructor() {
        this.basePath = 'assets/';
        
        // [구역 1] 이미지 에셋 (Images)
        this.images = {
            // 예: bg_territory: `${this.basePath}images/bg/territory.png`
        };

        // [구역 2] 오디오 에셋 (Audio)
        this.audio = {
            // 예: bgm_focus: `${this.basePath}audio/bgm/focus_lofi.mp3`
        };

        // [구역 3] 애니메이션 및 데이터 (Data/Atlas)
        this.data = {
            // 예: merc_atlas: `${this.basePath}data/mercenaries.json`
        };

        Logger.system("AssetPathManager: Initialized (Waiting for path definitions).");
    }

    /**
     * 특정 카테고리의 에셋 경로를 반환합니다.
     * @param {string} category 'images', 'audio', 'data'
     * @param {string} key 에셋 키값
     */
    getPath(category, key) {
        if (this[category] && this[category][key]) {
            return this[category][key];
        }
        Logger.warn("ASSET_MANAGER", `Asset path not found: ${category} -> ${key}`);
        return null;
    }
}

const assetPathManager = new AssetPathManager();
export default assetPathManager;
