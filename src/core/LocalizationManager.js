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
                
                // Focus Mode
                focus_mode: "Focus Mode",
                focus_playlist: "Playlist",
                focus_time: "Focus Time"
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
                
                // Focus Mode
                focus_mode: "집중 모드",
                focus_playlist: "플레이리스트",
                focus_time: "집중 시간"
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
