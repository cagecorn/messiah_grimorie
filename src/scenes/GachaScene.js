import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import displayManager from '../core/DisplayManager.js';
import gachaManager from '../systems/GachaManager.js';
import gachaSceneDOMManager from '../ui/gacha/GachaSceneDOMManager.js';

/**
 * 가챠 씬 (Gacha Scene)
 * 역할: [소환 연출 및 인터페이스 담당]
 */
export default class GachaScene extends Phaser.Scene {
    constructor() {
        super('GachaScene');
    }

    preload() {
        Logger.info("SCENE", "GachaScene: Preloading assets...");
        // 배경 이미지 로드
        this.load.image('gacha_bg', 'assets/background/terretory/gacha_background.png');
    }

    create() {
        Logger.info("SCENE", "GachaScene: Created.");

        // [CORE] 배경 설정 (BackgroundManager 사용)
        import('../systems/BackgroundManager.js').then(module => {
            module.default.setBackground(this, 'gacha_bg');
        });

        // 가챠 시스템 로직 초기화
        gachaManager.initialize();

        // 가챠 DOM UI 초기화
        gachaSceneDOMManager.ui_init();

        // [CLEANUP] 씬 종료 시 DOM 정리 명시적 등록
        this.events.once('shutdown', () => {
            gachaSceneDOMManager.ui_hide();
            // 배경 매니저에게 정지 알림 (필요 시)
        });
    }

    update() {
        // 소환 연출 관련 업데이트 (파티클 등)
    }
}
