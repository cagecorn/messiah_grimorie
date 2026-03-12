import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import displayManager from '../core/DisplayManager.js';
import territoryManager from '../systems/TerritoryManager.js';

/**
 * 영지 씬 (Territory Scene)
 * 역할: 게임의 메인 허브 (건설, 생산, 정비)
 */
export default class TerritoryScene extends Phaser.Scene {
    constructor() {
        super('TerritoryScene');
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
        
        // 영지 배경 깔기
        const center = displayManager.getCenter();
        const background = this.add.image(center.x, center.y, 'territory_bg');
        
        // 화면 크기에 맞춰 배경 스케일 조정 (Cover 방식)
        this.alignBackground(background);

        // 영지 시스템 초기화 (라우터 호출)
        territoryManager.initialize();

        // 리사이즈 대응
        this.scale.on('resize', () => {
            const newCenter = displayManager.getCenter();
            background.setPosition(newCenter.x, newCenter.y);
            this.alignBackground(background);
        });
    }

    alignBackground(bg) {
        const scaleX = this.scale.width / bg.width;
        const scaleY = this.scale.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);
    }
}
