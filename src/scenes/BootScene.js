import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import state from '../core/GlobalState.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        Logger.system("BootScene: Preloading assets...");
        // 향후 로딩 바 등 구현 예정
    }

    create() {
        Logger.info("SCENE", "BootScene: Core systems initialized.");
        
        // 유저 규칙: 글로벌 용어 통일 및 로깅
        Logger.system("메시아 그리모어 리부트 - 시스템 가동");
        
        // 다음 장면으로 이동 (일단은 바로 TerritoryScene 모방)
        this.scene.start('MainScene');
    }
}
