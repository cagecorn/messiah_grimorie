import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import loadingManager from '../core/LoadingManager.js';
import displayManager from '../core/DisplayManager.js';
import sceneManager from '../core/SceneManager.js';
import uiManager from '../ui/UIManager.js';
import formationManager from '../systems/FormationManager.js';
import assetPathManager from '../core/AssetPathManager.js';

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

        // [USER 요청] 바드 신규 자산 프리로드
        this.load.image('mass_heal_effect', assetPathManager.getPath('images', 'mass_heal_effect'));
        this.load.image('inspiration_effect', assetPathManager.getPath('images', 'inspiration_effect'));
        this.load.image('bard_projectile_effect', assetPathManager.getPath('images', 'bard_projectile_effect'));
        this.load.image('song_of_protection', assetPathManager.getPath('images', 'song_of_protection'));
        this.load.image('shield_effect', assetPathManager.getPath('images', 'shield_effect'));
        
        // [신규] 세이렌 및 아쿠아 버스트 관련
        this.load.image('siren_sprite', assetPathManager.getSummonPath('siren'));
        this.load.image('guardian_angel_sprite', assetPathManager.getSummonPath('guardian_angel'));
        
        // 아이콘들을 명시적인 키값으로 로드 (UI 및 HealthBar에서 이 키를 사용함)
        const iconKeys = ['shield', 'inspiration', 'stoneskin', 'sleep', 'knockback', 'airborne', 'invincible', 'music'];
        iconKeys.forEach(key => {
            const path = assetPathManager.getPath('images', key);
            if (path) this.load.image(key, path);
        });

        this.load.image('stone_skin_effect', assetPathManager.getPath('images', 'stone_skin_effect'));

        // [신규] 실비 스프라이트 및 사운드 프리로드
        this.load.image('merc_silvi_sprite', assetPathManager.getMercenaryPath('silvi', 'sprite'));
        this.load.audio('stone_skin_sfx', assetPathManager.getPath('audio', 'stone_skin_sfx'));
    }

    async create() {
        Logger.info("SCENE", "BootScene: Complete. Initializing Systems...");
        
        // 메시아 그리모어 리부트 공식 선언
        Logger.system("Messiah Grimoire: System Link Established.");
        
        // [CORE] 매니저 초기화
        sceneManager.initialize(this.game);

        // [SYSTEM] 데이터 컬렉션 및 초기 지급 시스템 (Hardcode-Free)
        const collectionModule = await import('../systems/MercenaryCollectionManager.js');
        await collectionModule.default.initialize();
        await formationManager.initialize();

        const starterModule = await import('../systems/StarterPackManager.js');
        await starterModule.default.checkAndAward();

        // [GLOBAL UI] 최상단 HUD 및 씬 전환 효과 초기화
        import('../ui/SceneTransitionDOMManager.js').then(module => {
            module.default.initialize();
        });

        import('../ui/TopHUDDOMManager.js').then(module => {
            module.default.initialize();
        });

        // 영지 씬으로 진입
        this.scene.start('TerritoryScene');
    }
}
