import Phaser from 'phaser';
import measurementManager from './core/MeasurementManager.js';
import BootScene from './scenes/BootScene.js';
import MainScene from './scenes/MainScene.js';

/**
 * ==========================================
 * ⚔️ [Core] Game Configuration
 * ==========================================
 * - [측량 매니저]를 사용하여 사이즈 관리
 * - Background execution enabled
 */

const config = {
    type: Phaser.AUTO,
    width: measurementManager.screen.width,
    height: measurementManager.screen.height,
    parent: 'game-container',
    backgroundColor: '#1a1a1a',
    scale: {
        mode: Phaser.Scale.FIT,
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
        }
    },
    scene: [BootScene, MainScene]
};

const game = new Phaser.Game(config);

export default game;
