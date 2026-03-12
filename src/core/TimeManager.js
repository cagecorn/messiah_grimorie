import EventBus, { EVENTS } from './EventBus.js';
import Logger from '../utils/Logger.js';

/**
 * 시간/업데이트 매니저 (Time & Update Manager)
 * 역할: [전역 연산 통제관]
 * 
 * 설명: 게임의 흐름(Update Loop)을 제어합니다. 궁극기 컷씬, 건설 모드 등
 * 모든 게임 연산을 잠시 멈춰야 할 때 이 매니저를 통해 전역 상태를 제어합니다.
 */
class TimeManager {
    constructor() {
        this.isPaused = false;
        this.timeScale = 1.0; // 배속 기능을 위한 예비 필드
        
        Logger.system("TimeManager: Initialized.");
    }

    /**
     * 게임 연산 일시 정지 (궁극기, UI 팝업 등)
     * @param {string} reason 정지 사유 (로그용)
     */
    pause(reason = "General") {
        if (this.isPaused) return;
        
        this.isPaused = true;
        Logger.info("TIME_SYSTEM", `Game PAUSED. Reason: ${reason}`);
        
        // 전역 이벤트 발행하여 AI 및 물리 엔진 등이 멈추도록 유도
        EventBus.emit('GAME_PAUSE', { reason });
    }

    /**
     * 게임 연산 재개
     */
    resume() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        Logger.info("TIME_SYSTEM", "Game RESUMED.");
        
        EventBus.emit('GAME_RESUME');
    }

    /**
     * 현재 정지 상태 확인
     */
    shouldUpdate() {
        return !this.isPaused;
    }

    /**
     * 시간 배속 설정 (방치형 게임의 배속 아이템 대비)
     */
    setTimeScale(scale) {
        this.timeScale = scale;
        Logger.info("TIME_SYSTEM", `Time Scale changed to: ${scale}x`);
        EventBus.emit('TIME_SCALE_CHANGED', scale);
    }
}

const timeManager = new TimeManager();
export default timeManager;
