import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import loadingManager from '../core/LoadingManager.js';
import displayManager from '../core/DisplayManager.js';
import sceneManager from '../core/SceneManager.js';
import uiManager from '../ui/UIManager.js';
import formationManager from '../systems/FormationManager.js';
import assetPathManager from '../core/AssetPathManager.js';
import emojiManager from '../core/EmojiManager.js';
import dungeonRoundManager from '../systems/dungeons/DungeonRoundManager.js';

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
        this.load.image('melee_effect', assetPathManager.getPath('images', 'melee_effect'));
        this.load.image('cloning_effect', assetPathManager.getPath('images', 'cloning_effect'));
        this.load.image('battojutsu_effect', assetPathManager.getPath('images', 'battojutsu_effect'));
        
        // [신규] 세이렌 및 아쿠아 버스트 관련
        this.load.image('siren_sprite', assetPathManager.getSummonPath('siren'));
        this.load.image('guardian_angel_sprite', assetPathManager.getSummonPath('guardian_angel'));
        this.load.image('babao_sprite', assetPathManager.getSummonPath('babao'));
        
        
        // [신규] EmojiManager에 등록된 모든 이모지 자산 자동 로드
        for (const [emoji, fileName] of Object.entries(emojiManager.emojiMap)) {
            const key = emojiManager.getAssetKey(emoji);
            this.load.image(key, `assets/emojis/${fileName}`);
        }
        
        // 아이콘들을 명시적인 키값으로 로드 (UI 및 HealthBar에서 이 키를 사용함)
        const iconKeys = ['shield', 'inspiration', 'stoneskin', 'sleep', 'knockback', 'airborne', 'invincible', 'music', 'stealth_icon', 'gale_icon', 'snapshot_icon', 'slow', 'atk_up', 'atk_speed_up', 'lifesteal'];
        iconKeys.forEach(key => {
            const path = assetPathManager.getPath('images', key);
            if (path) this.load.image(key, path);
        });

        this.load.image('stone_skin_effect', assetPathManager.getPath('images', 'stone_skin_effect'));
        this.load.image('stone_blast_projectile', assetPathManager.getPath('images', 'stone_blast_projectile'));
        this.load.image('stone_explosion_effect', assetPathManager.getPath('images', 'stone_explosion_effect'));
        this.load.image('rock_projectile', assetPathManager.getPath('images', 'rock_projectile'));
        this.load.image('falling_impact_effect', assetPathManager.getPath('images', 'falling_impact_effect'));
        this.load.image('bullet_projectile', assetPathManager.getPath('images', 'bullet_projectile'));
        this.load.image('tornado_shot_projectile', assetPathManager.getPath('images', 'tornado_shot_projectile'));
        this.load.image('flying_icon', assetPathManager.getPath('images', 'flying_icon'));
        this.load.image('smite_effect', assetPathManager.getPath('images', 'smite_effect'));
        this.load.image('blood_rage_effect', assetPathManager.getPath('images', 'blood_rage_effect'));
        this.load.image('magenta_drive_effect', assetPathManager.getPath('images', 'magenta_drive_effect'));
        
        // [신규] 레오나 (Leona) 관련 자산 프리로드
        this.load.image('electric_grenade_projectile', assetPathManager.getPath('images', 'electric_grenade_projectile'));
        this.load.image('electric_explosion_effect', assetPathManager.getPath('images', 'electric_explosion_effect'));
        this.load.image('electric_shock_effect', assetPathManager.getPath('images', 'electric_shock_effect'));
        this.load.image('shock', assetPathManager.getPath('images', 'shock'));
        this.load.image('carpet_bombing_projectile', assetPathManager.getPath('images', 'carpet_bombing_projectile'));
        this.load.image('missile_projectile', assetPathManager.getPath('images', 'missile_projectile'));

        // [신규] 실비 스프라이트 및 사운드 프리로드
        this.load.image('merc_silvi_sprite', assetPathManager.getMercenaryPath('silvi', 'sprite'));
        this.load.image('merc_ria_sprite', assetPathManager.getMercenaryPath('ria', 'sprite'));
        this.load.image('merc_joojoo_sprite', assetPathManager.getMercenaryPath('joojoo', 'sprite'));
        this.load.image('merc_king_sprite', assetPathManager.getMercenaryPath('king', 'sprite'));
        this.load.image('zayn_sprite', assetPathManager.getPath('images', 'zayn_sprite'));
        this.load.image('ria_sprite', assetPathManager.getPath('images', 'ria_sprite'));
        this.load.image('bao_sprite', assetPathManager.getPath('images', 'bao_sprite'));
        this.load.image('boon_sprite', assetPathManager.getPath('images', 'boon_sprite'));
        this.load.image('babao_sprite', assetPathManager.getPath('images', 'babao_sprite'));
        this.load.image('nana_sprite', assetPathManager.getMercenaryPath('nana', 'sprite'));
        this.load.image('nana_ultimate_sprite', 'assets/characters/party/nana_ultimate_sprite.png');
        this.load.audio('stone_skin_sfx', assetPathManager.getPath('audio', 'stone_skin_sfx'));
        this.load.audio('physical_hit_1', assetPathManager.getPath('audio', 'physical_hit_1'));
        this.load.audio('roll_sfx', assetPathManager.getPath('audio', 'roll_sfx'));
    }

    async create() {
        Logger.info("SCENE", "BootScene: Complete. Initializing Systems...");
        
        // 메시아 그리모어 리부트 공식 선언
        Logger.system("Messiah Grimoire: System Link Established.");
        
        // [CORE] 매니저 초기화
        sceneManager.initialize(this.game);

        // [PERSISTENCE] 전역 데이터(골드, 라운드 기록 등) 복구
        const currencyManager = (await import('../core/CurrencyManager.js')).default;
        await currencyManager.loadFromDB();

        // [SYSTEM] 데이터 컬렉션 및 초기 지급 시스템 (Hardcode-Free)
        const collectionModule = await import('../systems/MercenaryCollectionManager.js');
        await collectionModule.default.initialize();
        
        const materialModule = await import('../systems/MaterialManager.js');
        await materialModule.default.initialize();
        
        const inventoryManager = (await import('../core/InventoryManager.js')).default;
        await inventoryManager.initialize();

        await formationManager.initialize();
        dungeonRoundManager.initialize(); // [신규] 기록 동기화

        const starterModule = await import('../systems/StarterPackManager.js');
        await starterModule.default.checkAndAward();

        // [GLOBAL UI] 최상단 HUD 및 씬 전환 효과 초기화
        import('../ui/SceneTransitionDOMManager.js').then(module => {
            module.default.initialize();
        });

        import('../ui/TopHUDDOMManager.js').then(module => {
            module.default.initialize();
        });

        import('../ui/MessiahInventoryDOMManager.js').then(module => {
            module.default.initialize();
        });

        // 영지 씬으로 진입
        this.scene.start('TerritoryScene');
    }
}
