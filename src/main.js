import './styles/cutscene.css';
import './styles/character_info_card.css';
import './styles/quick_action_menu.css';
import './styles/round_hud.css';
import Phaser from 'phaser';

// Styles Modularization
import './styles/base.css';
import './styles/layout.css';
import './styles/top_hud.css';
import './styles/dungeon_dropdown.css';
import './styles/portrait_hud.css';
import './styles/territory.css';
import './styles/gacha.css';
import './styles/gacha_card.css';
import './styles/formation.css';
import './styles/graphics.css';
import './styles/scene_transition.css';
import './ui/styles/MessiahInventory.css';
import devCommandManager from './systems/DevCommandManager.js';

import displayManager from './core/DisplayManager.js';
import measurementManager from './core/MeasurementManager.js';
import BootScene from './scenes/BootScene.js';
import MainScene from './scenes/MainScene.js';
import TerritoryScene from './scenes/TerritoryScene.js';
import GachaScene from './scenes/GachaScene.js';
import FormationScene from './scenes/FormationScene.js';
import BattleScene from './scenes/BattleScene.js';

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
    pixelArt: false, // [유저 요청] 이미지가 너무 거칠게 보여서 다시 끔
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
    scene: [BootScene, TerritoryScene, GachaScene, FormationScene, BattleScene, MainScene]
};

const game = new Phaser.Game(config);

// [신규] 전역 접근성 확보
window.game = game;

// [신규] 개발자 명령어 매니저 초기화
devCommandManager.init();

export default game;
