import EventBus, { EVENTS } from './EventBus.js';
import Logger from '../utils/Logger.js';
import state from './GlobalState.js';

/**
 * 설정 매니저 (Settings Manager)
 * 역할: [라우터 (Router) & 최고 권위 설정 관리자]
 * 
 * 설명: 게임의 모든 설정을 총괄하는 최상위 라우터입니다.
 * 이 매니저의 결정은 '절대적'이며, 설정 변경 시 EventBus를 통해 관련 모든 매니저에 방송(Broadcast)합니다.
 */
class SettingsManager {
    constructor() {
        this.initialize();
    }

    initialize() {
        Logger.system("SettingsManager Router: Initialized (Absolute authority mode).");
    }

    /**
     * 설정을 업데이트하고 관련 시스템에 명령을 라우팅합니다.
     * @param {string} key 설정 키 (e.g., 'volume', 'language', 'focusMode')
     * @param {any} value 새로운 값
     */
    set(key, value) {
        Logger.info("SETTINGS_ROUTER", `Changing setting: ${key} -> ${value}`);

        // 1. 글로벌 상태(State) 업데이트
        if (state.settings.hasOwnProperty(key)) {
            state.settings[key] = value;
        }

        // 2. 관련 매니저들로 명령 라우팅 (EventBus 방송)
        switch (key) {
            case 'language':
                EventBus.emit(EVENTS.LANGUAGE_CHANGED, value);
                break;
            case 'volume':
                EventBus.emit('VOLUME_CHANGED', value);
                break;
            case 'focusMode':
                EventBus.emit(EVENTS.FOCUS_MODE_CHANGED, value);
                break;
            case 'bgmPaused':
                EventBus.emit('BGM_PAUSE_TOGGLE', value);
                break;
            default:
                EventBus.emit(`SETTING_CHANGED_${key.toUpperCase()}`, value);
                break;
        }

        // 3. 변경된 설정을 저장하도록 라우팅 요청
        EventBus.emit(EVENTS.SAVE_DATA, { settings: state.settings });
    }

    /**
     * 설정값을 안전하게 가져옵니다.
     */
    get(key) {
        return state.settings[key];
    }

    /**
     * 초기 설정 로드 (Save data 로드 시 호출)
     */
    applyAll(settings) {
        Logger.info("SETTINGS_ROUTER", "Applying bulk settings updates.");
        Object.keys(settings).forEach(key => {
            if (state.settings.hasOwnProperty(key)) {
                this.set(key, settings[key]);
            }
        });
    }
}

const settingsManager = new SettingsManager();
export default settingsManager;
