import Phaser from 'phaser';
import displayManager from './core/DisplayManager.js';
import measurementManager from './core/MeasurementManager.js';
import BootScene from './scenes/BootScene.js';
import MainScene from './scenes/MainScene.js';

/**
 * ==========================================
 * ⚔️ [Core] Game Configuration
 * ==========================================
 * - [디스플레이 매니저]를 통한 유연한 해상도 적용
 * - [측량 매니저]와의 데이터 동기화
 */

const displayConfig = displayManager.getInitialConfig();

const config = {
    type: Phaser.AUTO,
    width: displayConfig.width,
    height: displayConfig.height,
    parent: 'game-container',
    backgroundColor: '#1a1a1a',
    scale: {
        // RESIZE 모드를 사용하여 브라우저 창 변화에 즉시 대응하고 검은 여백을 없앰
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    audio: {
        disableWebAudio: false,
        noAudio: false
    },
    dom: {
        createContainer: true
    },
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    callbacks: {
        postBoot: function (game) {
            game.sound.pauseOnBlur = false;
            
            // 창 크기 조절 이벤트 리스너 등록
            window.addEventListener('resize', () => {
                displayManager.handleResize(game);
            });
        }
    },
    scene: [BootScene, MainScene]
};

const game = new Phaser.Game(config);

export default game;
