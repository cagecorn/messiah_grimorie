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
            arrow_projectile: `${this.basePath}effect/arrow_projectile.png`,
            healing_effect: `${this.basePath}effect/healing_effect.png`,
            mass_heal_effect: `${this.basePath}effect/mass_heal_effect.png`,
            guardian_angel_sprite: `${this.basePath}characters/summon/guardian_angel_sprite.png`,
            summon_guardian_angel_effect: `${this.basePath}effect/summon_guardian_angel_effect.png`,
            light_projectile: `${this.basePath}effect/light_projectile.png`,
            wizard_projectile: `${this.basePath}effect/wizard_projectile_effect.png`,
            meteor_sprite: `${this.basePath}effect/meteor_sprite.png`,
            explosion_effect: `${this.basePath}effect/explosion_effect.png`,
            sleep_icon: `${this.basePath}icon/sleep_icon.png`,
            shield_icon: `${this.basePath}icon/shield_icon.png`,
            shield_effect: `${this.basePath}effect/shield_effect.png`,
            inspiration_icon: `${this.basePath}icon/inspiration_icon.png`,
            inspiration_effect: `${this.basePath}effect/inspiration_effect.png`,
            bard_projectile_effect: `${this.basePath}effect/bard_projectile_effect.png`,
            song_of_protection: `${this.basePath}effect/song_of_protection.png`,
            aqua_burst_projectile: `${this.basePath}effect/aqua_burtst_projectile.png`,
            stunned: `${this.basePath}icon/debuff_stun.png`,
            burned: `${this.basePath}icon/debuff_burn.png`,
            knockback: `${this.basePath}icon/knockback_icon.png`,
            airborne: `${this.basePath}icon/airborne_icon.png`,
            invincible: `${this.basePath}icon/invincible_icon.png`,
            stoneskin: `${this.basePath}icon/stone_skin_icon.png`,
            stone_skin_effect: `${this.basePath}effect/stone_skin_effect.png`,
            
            // 버프/디버프 아이콘 표준 키셋 (ls 기반 확인)
            shield: `${this.basePath}icon/shield_icon.png`,
            inspiration: `${this.basePath}icon/inspiration_icon.png`,
            music: `${this.basePath}icon/music_icon.png`,
            sleep: `${this.basePath}icon/sleep_icon.png`,
            knockback: `${this.basePath}icon/knockback_icon.png`,
            airborne: `${this.basePath}icon/airborne_icon.png`
        };

        // [구역 2] 오디오 에셋 (Audio)
        this.audio = {
            // 예: bgm_focus: `${this.basePath}audio/bgm/focus_lofi.mp3`
            explosive_1: `${this.basePath}sfx/explosive-1.mp3`,
            stone_skin_sfx: `${this.basePath}sfx/crack-1.mp3`
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
     * 소환수 관련 에셋 경로 생성 (Summon Asset Rules)
     * @param {string} summonId 소환수 식별자
     * @param {string} type 'sprite' | 'cutscene'
     */
    getSummonPath(summonId, type = 'sprite') {
        const summonPath = `${this.basePath}characters/summon/`;
        let fileName = `${summonId}_${type}.png`;
        
        return `${summonPath}${fileName}`;
    }

    /**
     * 특정 카테고리의 에셋 경로를 반환합니다.
     * @param {string} category 'images', 'audio', 'data'
     * @param {string} key 에셋 키값
     */
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

    /**
     * 엔티티의 공용 경로 반환 (용병, 몬스터, 소환수 통합)
     * @param {string} id 엔티티 ID (baseId)
     * @param {string} type 'mercenary' | 'monster' | 'summon'
     * @param {string} subType 'sprite' | 'cutscene'
     */
    getUniversalEntityPath(id, type = 'mercenary', subType = 'sprite') {
        const lowerId = id.toLowerCase();
        
        switch (type) {
            case 'monster':
                return this.getEnemyPath(lowerId, subType);
            case 'summon':
                return this.getSummonPath(lowerId, subType);
            case 'mercenary':
            default:
                return this.getMercenaryPath(lowerId, subType);
        }
    }
}

const assetPathManager = new AssetPathManager();
export default assetPathManager;
