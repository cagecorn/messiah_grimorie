import EventBus, { EVENTS } from './EventBus.js';
import Logger from '../utils/Logger.js';

/**
 * 로컬라이제이션 매니저 (Localization Manager)
 * 중앙화된 용어 관리 시스템. 영어를 기본으로 하며 한국어를 지원합니다.
 */
class LocalizationManager {
    constructor() {
        this.currentLanguage = 'en'; // 기본 언어: 영어
        this.translations = {
            en: {
                // Global Terms
                game_title: "Black Behemoth: Messiah Grimoire",
                territory: "Territory",
                dungeon: "Dungeon",
                arena: "Arena",
                raid: "Raid",
                mercenary: "Mercenary",
                inventory: "Inventory",
                settings: "Settings",
                
                // UI & Actions
                btn_start: "Start",
                btn_save: "Save",
                btn_load: "Load",
                btn_back: "Back",
                
                // Messiah Powers
                power_judgment: "Judgment",
                power_healing: "Healing",
                power_encouragement: "Encouragement",
                
                // Resources
                gold: "Gold",
                gem: "Gem",
                shop: "Shop",
                gacha: "Summon",
                formation: "Formation",
                siege: "Siege",
                
                // Focus Mode
                focus_mode: "Focus Mode",
                focus: "Focus",
                focus_playlist: "Playlist",
                focus_time: "Focus Time",

                // Territory Menu
                menu_roster_title: "ROSTER",
                menu_roster_desc: "MERCENARY ROSTER",
                menu_shop_title: "SHOP",
                menu_shop_desc: "PURCHASE ITEMS",
                menu_gacha_title: "SUMMON",
                menu_gacha_desc: "RECRUIT UNITS",
                menu_equipment_title: "EQUIPMENT",
                menu_equipment_desc: "EQUIPMENT",
                menu_pets_title: "PETS",
                menu_pets_desc: "PET STORAGE",
                menu_npc_title: "NPC HIRE",
                menu_npc_desc: "NPC HIRE",
                menu_messiah_title: "MESSIAH TOUCH",
                menu_messiah_desc: "MESSIAH TOUCH",
                menu_structures_title: "STRUCTURES",
                menu_structures_desc: "STRUCTURES",
                menu_achievements_title: "ACHIEVEMENTS",
                menu_achievements_desc: "ACHIEVEMENTS",
                menu_monster_title: "MONSTER CODEX",
                menu_monster_desc: "MONSTER CODEX",
                menu_cooking_title: "COOKING",
                menu_cooking_desc: "COOKING",
                menu_fishing_title: "FISHING",
                menu_fishing_desc: "FISHING",
                menu_alchemy_title: "ALCHEMY",
                menu_alchemy_desc: "ALCHEMY",
                menu_mining_title: "MINING",
                menu_mining_desc: "MINING",
                menu_logging_title: "LOGGING",
                menu_logging_desc: "LOGGING",
                menu_focus_title: "FOCUS & MUSIC",
                menu_focus_desc: "FOCUS & MUSIC",

                // Gacha Specific
                gacha_summon_5: "Summon x5",
                gacha_summon_pet: "Summon Pet",
                gacha_summon_mercenary: "Summon Mercenary",
                gacha_collection_title: "Collection Status",
                gacha_cost_gold: "Gold",
                gacha_cost_gem: "Gem",
                shop: "Shop",
                gacha: "Summon"
            },
            ko: {
                // Global Terms
                game_title: "블랙 베히모스: 메시아 그리모어",
                territory: "영지",
                dungeon: "던전",
                arena: "아레나",
                raid: "레이드",
                mercenary: "용병",
                inventory: "인벤토리",
                settings: "설정",
                
                // UI & Actions
                btn_start: "시작",
                btn_save: "저장",
                btn_load: "불러오기",
                btn_back: "뒤로",
                
                // Messiah Powers
                power_judgment: "심판",
                power_healing: "치료",
                power_encouragement: "격려",
                
                // Resources
                gold: "골드",
                gem: "다이아",
                shop: "상점",
                gacha: "소환",
                formation: "편성",
                siege: "공성전",
                
                // Focus Mode
                focus_mode: "집중 모드",
                focus: "집중",
                focus_playlist: "플레이리스트",
                focus_time: "집중 시간",

                // Territory Menu
                menu_roster_title: "용병 도감",
                menu_roster_desc: "ROSTER",
                menu_shop_title: "상점",
                menu_shop_desc: "아이템을 구매하세요",
                menu_gacha_title: "소환",
                menu_gacha_desc: "추종자들을 영입하세요",
                menu_equipment_title: "장비 관리",
                menu_equipment_desc: "EQUIPMENT",
                menu_pets_title: "펫 보관함",
                menu_pets_desc: "PET STORAGE",
                menu_npc_title: "NPC 고용",
                menu_npc_desc: "NPC HIRE",
                menu_messiah_title: "메시아 권능",
                menu_messiah_desc: "MESSIAH TOUCH",
                menu_structures_title: "방어 시설 관리",
                menu_structures_desc: "STRUCTURES",
                menu_achievements_title: "업적",
                menu_achievements_desc: "ACHIEVEMENTS",
                menu_monster_title: "몬스터 도감",
                menu_monster_desc: "MONSTER CODEX",
                menu_cooking_title: "요리",
                menu_cooking_desc: "COOKING",
                menu_fishing_title: "낚시",
                menu_fishing_desc: "FISHING",
                menu_alchemy_title: "연금술",
                menu_alchemy_desc: "ALCHEMY",
                menu_mining_title: "채광",
                menu_mining_desc: "MINING",
                menu_logging_title: "벌목",
                menu_logging_desc: "LOGGING",
                menu_focus_title: "집중 모드 & 음반 관리",
                menu_focus_desc: "FOCUS & MUSIC",

                // Gacha Specific
                gacha_summon_5: "5연속 영입",
                gacha_summon_pet: "펫 영입 (1마리)",
                gacha_summon_mercenary: "용병 영입 (1명)",
                gacha_collection_title: "용병 보유 현황",
                gacha_cost_gold: "골드",
                gacha_cost_gem: "다이아",
                shop: "상점",
                gacha: "소환"
            }
        };
    }

    /**
     * 언어 설정 변경
     * @param {string} lang 'en' or 'ko'
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            Logger.info("SYSTEM", `Language changed to: ${lang}`);
            EventBus.emit(EVENTS.LANGUAGE_CHANGED, lang);
        } else {
            Logger.warn("SYSTEM", `Unsupported language: ${lang}`);
        }
    }

    /**
     * 텍스트 가져오기
     * @param {string} key 번역 키값
     * @returns {string} 번역된 텍스트
     */
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
}

const localizationManager = new LocalizationManager();
export default localizationManager;
