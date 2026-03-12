import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import loadingManager from '../core/LoadingManager.js';
import displayManager from '../core/DisplayManager.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        Logger.system("BootScene: Preloading core assets...");
        
        const center = displayManager.getCenter();
        
        // [UI] 로딩바 레이아웃 (Phaser Graphic)
        const width = 400;
        const height = 30;
        const x = center.x - width / 2;
        const y = center.y;

        const progressBox = this.add.graphics();
        const progressBar = this.add.graphics();
        
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(x, y, width, height);

        // 로딩 텍스트
        const loadingText = this.add.text(center.x, y - 30, 'Loading Messiah Grimoire...', {
            font: '20px monospace',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const percentText = this.add.text(center.x, y + 15, '0%', {
            font: '18px monospace',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // LoadingManager 연동
        loadingManager.onStart(this);

        this.load.on('progress', (value) => {
            loadingManager.onProgress(value);
            progressBar.clear();
            progressBar.fillStyle(0x00fbff, 1);
            progressBar.fillRect(x + 5, y + 5, (width - 10) * value, height - 10);
            percentText.setText(parseInt(value * 100) + '%');
        });

        this.load.on('complete', () => {
            loadingManager.onComplete();
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        this.load.on('error', (file) => {
            loadingManager.onError(file);
        });

        // 테스트용 더미 자산 (로딩바 확인용)
        // 실제 로직이 들어가면 삭제 예정
        for (let i = 0; i < 50; i++) {
            this.load.image('dummy_' + i, 'favicon.ico');
        }
    }

    create() {
        Logger.info("SCENE", "BootScene: Complete. Transitioning to Territory.");
        
        // 메시아 그리모어 리부트 공식 선언
        Logger.system("Messiah Grimoire: System Link Established.");
        
        // [GLOBAL UI] 최상단 HUD 초기화 (한 번만 실행)
        const topHUDDOMManager = this.scene.systems.game.plugins.get('topHUDDOMManager'); // 만약 글로벌로 관리한다면... 
        // 일단은 직접 임포트해서 초기화
        import('../ui/TopHUDDOMManager.js').then(module => {
            module.default.initialize();
        });

        // 영지 씬으로 진입
        this.scene.start('TerritoryScene');
    }
}
