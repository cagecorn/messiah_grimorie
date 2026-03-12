import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import displayManager from '../core/DisplayManager.js';
import territoryManager from '../systems/TerritoryManager.js';
import territoryDOMManager from '../ui/territory/TerritoryDOMManager.js';

/**
 * 영지 씬 (Territory Scene)
 * 역할: 게임의 메인 허브 (건설, 생산, 정비)
 */
export default class TerritoryScene extends Phaser.Scene {
    constructor() {
        super('TerritoryScene');
    }

    update() {
        // [HEARTBEAT] 렌더링 확인용 로그 (프레임 드랍 여부 체크)
        // 60프레임 중 1프레임 정도만 찍힘
        if (Phaser.Math.Between(1, 60) === 1) {
            // Logger.debug("SCENE", "TerritoryScene Alive & Rendering.");
        }
    }

    preload() {
        // [HARDCODE-FREE] AssetPathManager 등을 통해 경로를 가져와야 하지만, 
        // 유저 요청에 따라 특정 경로 이미지를 로드합니다.
        const bgPath = 'assets/background/terretory/terretory_background.png';
        this.load.image('territory_bg', bgPath);
        
        Logger.info("SCENE", "TerritoryScene: Loading background assets...");
    }

    create() {
        Logger.info("SCENE", "TerritoryScene: Hub initialized.");
        
        // [CORE] 배경 설정 (BackgroundManager 사용)
        import('../systems/BackgroundManager.js').then(module => {
            module.default.setBackground(this, 'territory_bg');
        });

        // 영지 시스템 초기화 (라우터 호출)
        territoryManager.initialize();
        territoryDOMManager.ui_init();
    }

    alignBackground(bg) {
        const scaleX = this.scale.width / bg.width;
        const scaleY = this.scale.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);
    }
}
