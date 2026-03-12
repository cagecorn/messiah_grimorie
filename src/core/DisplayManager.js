import Logger from '../utils/Logger.js';
import EventBus from './EventBus.js';

/**
 * 디스플레이 매니저 (Display Manager)
 * 역할: [해상도 및 레이아웃 최적화]
 * 
 * 설명: 웹브라우저 창 크기에 따라 게임 해상도를 유연하게 조절합니다.
 * '레터박스(검은 바)'를 제거하고 화면을 가득 채우면서도 UI 배치를 최적화합니다.
 */
class DisplayManager {
    constructor() {
        this.baseWidth = 1280;
        this.baseHeight = 720;
        this.currentWidth = window.innerWidth;
        this.currentHeight = window.innerHeight;
        
        Logger.system("DisplayManager: Initialized (Reactive resolution ready).");
    }

    /**
     * 페이저 설정용 초기 해상도 계산
     */
    getInitialConfig() {
        return {
            width: this.currentWidth,
            height: this.currentHeight,
            // 픽셀이 뭉개지지 않도록 정수 단위로 관리
            autoRound: true 
        };
    }

    /**
     * 창 크기 변경 시 호출되는 리사이즈 로직
     */
    handleResize(game) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.currentWidth = width;
        this.currentHeight = height;

        // 게임 캔버스 사이즈 즉시 업데이트 (레터박스 방지)
        game.scale.resize(width, height);

        Logger.info("DISPLAY_SYSTEM", `Resolution changed: ${width}x${height}`);
        
        // UI 재배치를 위한 이벤트 발행
        EventBus.emit('DISPLAY_RESIZE', { width, height });
    }

    /**
     * 화면 중앙 좌표 반환
     */
    getCenter() {
        return {
            x: this.currentWidth / 2,
            y: this.currentHeight / 2
        };
    }

    /**
     * 기준 해상도 대비 현재 스케일 비율
     */
    getScale() {
        return Math.min(this.currentWidth / this.baseWidth, this.currentHeight / this.baseHeight);
    }
}

const displayManager = new DisplayManager();
export default displayManager;
