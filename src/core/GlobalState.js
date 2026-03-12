import localizationManager from './LocalizationManager.js';

/**
 * 전역 상태 관리 (Global State Management)
 * 'Managed God Object' - 모든 데이터를 한 곳에서 관리하되 논리적으로 구분합니다.
 */
class GlobalState {
    constructor() {
        this.reset();
    }

    reset() {
        // [구역 1] 유저 기본 정보
        this.user = {
            id: 'dev_player',
            level: 1,
            exp: 0,
            gold: 0, // emoji_coin
            gem: 0   // emoji_gem
        };

        // [구역 2] 게임 진행 상태
        this.gameState = {
            currentScene: 'Boot',
            unlockedDungeons: ['forest'],
            isFocusMode: false
        }

        // [구역 3] 시스템 설정
        this.settings = {
            language: localizationManager.currentLanguage,
            volume: 0.5,
            isBgmPaused: false
        };

        console.log("🧠 [GlobalState] Initialized.");
    }

    // 언어 변경 연동
    setLanguage(lang) {
        localizationManager.setLanguage(lang);
        this.settings.language = lang;
    }

    // 번역 헬퍼
    t(key) {
        return localizationManager.t(key);
    }
}

const state = new GlobalState();
export default state;
