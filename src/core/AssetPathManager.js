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
            battle_forest_bg: `${this.basePath}background/battle_stage/battle-stage-cursed-forest.png`,
            arrow_projectile: `${this.basePath}effect/arrow_projectile.png`
        };

        // [구역 2] 오디오 에셋 (Audio)
        this.audio = {
            // 예: bgm_focus: `${this.basePath}audio/bgm/focus_lofi.mp3`
        };

        // [구역 3] 애니메이션 및 데이터 (Data/Atlas)
        this.data = {
            // 예: merc_atlas: `${this.basePath}data/mercenaries.json`
        };

        Logger.system("AssetPathManager: Initialized with Mercenary Asset Rules.");
    }

    /**
     * 용병 관련 에셋 경로 생성 (Mercenary Asset Rules)
     * @param {string} mercId 용병 식별자
     * @param {string} type 'sprite' | 'cutscene'
     */
    getMercenaryPath(mercId, type) {
        const partyPath = `${this.basePath}characters/party/`;
        if (type === 'sprite') {
            return `${partyPath}${mercId}_sprite.png`;
        } else if (type === 'cutscene') {
            return `${partyPath}${mercId}_cutscene.png`;
        }
        return null;
    }

    /**
     * 몬스터/적 관련 에셋 경로 생성 (Enemy Asset Rules)
     * @param {string} enemyId 적 식별자
     * @param {string} type 'sprite' | 'cutscene'
     */
    getEnemyPath(enemyId, type) {
        const enemyPath = `${this.basePath}characters/enemies/`;
        if (type === 'sprite') {
            return `${enemyPath}${enemyId}_sprite.png`;
        } else if (type === 'cutscene') {
            return `${enemyPath}${enemyId}_cutscene.png`;
        }
        return null;
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
