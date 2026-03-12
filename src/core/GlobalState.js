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
            language: 'ko',
            volume: 0.5,
            isBgmPaused: false
        };

        console.log("🧠 [GlobalState] Initialized.");
    }

    // 데이터 저장/로드 로직 등 추가 예정
}

const state = new GlobalState();
export default state;
