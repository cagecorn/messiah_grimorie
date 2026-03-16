import Logger from '../utils/Logger.js';

/**
 * 에셋 경로 매니저 (Asset Path Manager)
 * 역할: [중앙 경로 저장소]
 */
class AssetPathManager {
    constructor() {
        this.basePath = 'assets/';
        
        // [구역 1] 이미지 에셋 (Images)
        this.images = {
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
            aqua_burst_projectile: `${this.basePath}effect/aqua_burst_projectile.png`,
            aqua_explosion_effect: `${this.basePath}effect/aqua_explosion_effect.png`,
            fire_burst_projectile: `${this.basePath}effect/fire_burst_projectile.png`,
            fire_explosion_effect: `${this.basePath}effect/fire_explosion_effect.png`,
            stunned: `${this.basePath}icon/debuff_stun.png`,
            burned: `${this.basePath}icon/debuff_burn.png`,
            knockback: `${this.basePath}icon/knockback_icon.png`,
            airborne: `${this.basePath}icon/airborne_icon.png`,
            invincible: `${this.basePath}icon/invincible_icon.png`,
            stoneskin: `${this.basePath}icon/stone_skin_icon.png`,
            stone_skin_effect: `${this.basePath}effect/stone_skin_effect.png`,
            melee_effect: `${this.basePath}effect/melee_effect.png`,
            
            // 버프/디버프 아이콘 표준 키셋
            shield: `${this.basePath}icon/shield_icon.png`,
            inspiration: `${this.basePath}icon/inspiration_icon.png`,
            music: `${this.basePath}icon/music_icon.png`,
            sleep: `${this.basePath}icon/sleep_icon.png`,
            
            // [신규] 고블린 위자드 에셋
            goblin_wizard: `${this.basePath}characters/enemies/goblin_wizard_sprite.png`,
            goblin_wizard_cutscene: `${this.basePath}characters/enemies/goblin_wizard_cutscene.png`
        };

        // [구역 2] 오디오 에셋 (Audio)
        this.audio = {
            explosive_1: `${this.basePath}sfx/explosive-1.mp3`,
            stone_skin_sfx: `${this.basePath}sfx/crack-1.mp3`,
            roll_sfx: `${this.basePath}sfx/roll.mp3`
        };

        // [구역 3] 애니메이션 및 데이터 (Data/Atlas)
        this.data = {};

        Logger.system("AssetPathManager: Initialized.");
    }

    getMercenaryPath(mercId, type) {
        const partyPath = `${this.basePath}characters/party/`;
        if (type === 'sprite') {
            return `${partyPath}${mercId}_sprite.png`;
        } else if (type === 'cutscene') {
            return `${partyPath}${mercId}_cutscene.png`;
        }
        return null;
    }

    getEnemyPath(enemyId, type) {
        const enemyPath = `${this.basePath}characters/enemies/`;
        if (type === 'sprite') {
            return `${enemyPath}${enemyId}_sprite.png`;
        } else if (type === 'cutscene') {
            return `${enemyPath}${enemyId}_cutscene.png`;
        }
        return null;
    }

    getSummonPath(summonId, type = 'sprite') {
        const summonPath = `${this.basePath}characters/summon/`;
        return `${summonPath}${summonId}_${type}.png`;
    }

    getPath(category, key) {
        if (this[category] && this[category][key]) {
            return this[category][key];
        }
        Logger.warn("ASSET_MANAGER", `Asset path not found: ${category} -> ${key}`);
        return null;
    }

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
