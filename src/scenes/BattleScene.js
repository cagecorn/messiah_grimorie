import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import EventBus, { EVENTS } from '../core/EventBus.js';
import spawnManager from '../systems/combat/SpawnManager.js';
import backgroundManager from '../systems/BackgroundManager.js';
import assetPathManager from '../core/AssetPathManager.js';
import displayManager from '../core/DisplayManager.js';
import measurementManager from '../core/MeasurementManager.js';
import dungeonStageManager from '../systems/DungeonStageManager.js';
import graphicManager from '../systems/graphics/GraphicManager.js';
import cameraManager from '../core/CameraManager.js';
import shadowManager from '../systems/graphics/ShadowManager.js';
import fxManager from '../systems/graphics/FXManager.js';
import animationManager from '../systems/graphics/AnimationManager.js';
import phaserParticleManager from '../systems/graphics/PhaserParticleManager.js';
import soundManager from '../systems/SoundManager.js';
import ultimateCutsceneManager from '../ui/UltimateCutsceneManager.js';
import portraitHUDManager from '../systems/PortraitHUDManager.js';

/**
 * 전투 씬 (Battle Scene)
 * 역할: [전투 레이아웃 및 객체 관리]
 * 
 * 설명: 던전 입장 시 전환되는 실제 전투 장면입니다.
 * 배경 출력, 유닛 스폰, AI 및 이동 로직의 실시간 업데이트를 총괄합니다.
 */
export default class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene');
        this.stageId = null;
        this.allies = [];
        this.enemies = [];
    }

    init(data) {
        this.stageId = data.stageId || 'cursed_forest';
        Logger.info("BATTLE_SCENE", `Initializing battle for stage: ${this.stageId}`);
    }

    preload() {
        // 1. 배경 설정 (Dungeon Manager -> AssetPathManager 연동)
        const stage = dungeonStageManager.getCurrentStage();
        if (stage) {
            const mapConfig = stage.getMapConfig();
            this.bgKey = mapConfig.bgKey;
            const bgPath = assetPathManager.getPath('images', this.bgKey);
            if (bgPath) {
                this.load.image(this.bgKey, bgPath);
                Logger.info("BATTLE_LOADER", `Preloading background: ${this.bgKey} from ${bgPath}`);
            }
        }

        // 2. 유닛 에셋 프리로드 (SpawnManager 연동)
        const requiredAssets = spawnManager.getRequiredAssets();
        requiredAssets.forEach(asset => {
            this.load.image(asset.key, asset.path);
            Logger.info("BATTLE_LOADER", `Preloading unit asset: ${asset.key} from ${asset.path}`);
        });

        // 3. [신규] 고해상도 피격/회복 이펙트 프리로드
        const healingPath = assetPathManager.getPath('images', 'healing_effect');
        if (healingPath) {
            this.load.image('healing_effect', healingPath);
            Logger.info("BATTLE_LOADER", `Preloading explicit effect: healing_effect from ${healingPath}`);
        }
        this.load.image('impact_phys_1', 'assets/effect/phisycal_impact_effect_1.png');
        this.load.image('impact_phys_2', 'assets/effect/phisycal_impact_effect_2.png');
        this.load.image('charge_attack', 'assets/effect/charge_attack.png');
        this.load.image('for_messiah', 'assets/effect/for_messiah.png');
        this.load.image('arrow_projectile', assetPathManager.getPath('images', 'arrow_projectile'));
        this.load.image('knockback_shot_projectile', 'assets/effect/knockback_shot_projectile.png');
        this.load.image('healing_effect', assetPathManager.getPath('images', 'healing_effect'));
        this.load.image('mass_heal_effect', assetPathManager.getPath('images', 'mass_heal_effect'));
        this.load.image('guardian_angel_sprite', assetPathManager.getPath('images', 'guardian_angel_sprite'));
        this.load.image('summon_guardian_angel_effect', assetPathManager.getPath('images', 'summon_guardian_angel_effect'));
        this.load.image('light_projectile', assetPathManager.getPath('images', 'light_projectile'));
        this.load.image('wizard_projectile', assetPathManager.getPath('images', 'wizard_projectile'));
        this.load.image('meteor_sprite', assetPathManager.getPath('images', 'meteor_sprite'));

        // [신규] 상태 이상 아이콘 프리로드
        this.load.image('/assets/icon/knockback_icon.png', '/assets/icon/knockback_icon.png');
        this.load.image('/assets/icon/airborne_icon.png', '/assets/icon/airborne_icon.png');
        this.load.image('/assets/icon/debuff_stun.png', '/assets/icon/debuff_stun.png');
        this.load.image('/assets/icon/debuff_burn.png', '/assets/icon/debuff_burn.png');
        this.load.image('/assets/icon/invincible_icon.png', '/assets/icon/invincible_icon.png');

        Logger.info("BATTLE_LOADER", "Preloading physical impact effects, skill assets, projectiles, and status icons.");

        // 4. [신규] 타격 효과음 프리로드
        this.load.audio('hit_phys_1', 'assets/sfx/hitting-1.mp3');
        this.load.audio('hit_phys_2', 'assets/sfx/hitting-2.mp3');
        this.load.audio('hit_phys_3', 'assets/sfx/hitting-3.mp3');
        this.load.audio('unit_fallen', 'assets/sfx/fallen-1.mp3');
        this.load.audio('arrow_1', 'assets/sfx/arrow_1.mp3');
        this.load.audio('magic_hit_1', 'assets/sfx/magic-hit-1.mp3');
        this.load.audio('explosive_1', 'assets/sfx/explosive-1.mp3');
        Logger.info("BATTLE_LOADER", "Preloading hitting sound effects and death sfx.");
    }

    async create() {
        Logger.system(`BattleScene: Started (${this.stageId})`);

        // [측량 매니저] 월드 및 물리 경계 설정
        const world = measurementManager.world;
        this.physics.world.setBounds(0, 0, world.width, world.height);
        this.cameras.main.setBounds(0, 0, world.width, world.height);

        // [카메라 매니저] 메인 카메라 등록
        cameraManager.setMainCamera(this.cameras.main);

        // 배경 이미지 출력
        if (this.bgKey) {
            backgroundManager.setBackground(this, this.bgKey, {
                fixedScale: world.bgScale
            });
        }

        // [SYSTEM] 매니저 레이어 동적 로드 및 초기화
        await this.initializeManagers();

        // [GRAPHICS] 시각 효과 적용
        await graphicManager.initialize();
        graphicManager.applySceneFX(this);

        // 전역 이벤트 알림
        EventBus.emit(EVENTS.SCENE_CHANGED, 'BattleScene');

        // [신규] 씬 종료 시 정리
        this.events.once('shutdown', () => {
            if (this.projectileManager) this.projectileManager.clear();
            if (this.aiManager) this.aiManager.clear();
            portraitHUDManager.clear();
        });

        // [USER 요청] 카메라 지터링 방지: 모든 물리 업데이트가 끝난 후 카메라 이동
        this.events.on(Phaser.Scenes.Events.POST_UPDATE, () => {
            cameraManager.updateFollowAllies(this, this.allies, 16.6); // 고정 60fps 기준 델타
        });
    }

    async initializeManagers() {
        try {
            // 스폰 매니저
            const spawnModule = await import('../systems/combat/SpawnManager.js');
            this.spawnManager = spawnModule.default;

        // [USER 요청] 스테이지 시작 시 ID 카운터 초기화 (ID 혼란 방지)
        const instanceIDModule = await import('../utils/InstanceIDManager.js');
        instanceIDModule.default.reset();

        // 전열 이동 매니저
        const moveModule = await import('../systems/combat/MovementManager.js');
        this.movementManager = moveModule.default;

            // AI 매니저
            const aiModule = await import('../systems/ai/AIManager.js');
            this.aiManager = aiModule.default;

            Logger.info("BATTLE", "Combat managers loaded and initialized.");

            // 초기 유닛 스폰 실행
            this.spawnInitialUnits();

        } catch (err) {
            Logger.error("BATTLE_INIT", `Failed to load managers: ${err.message}`);
        }
    }

    async spawnInitialUnits() {
        if (!this.spawnManager) return;

        // [그래픽] 그래픽 시스템 초기화
        fxManager.init(this);
        animationManager.init(this);
        phaserParticleManager.init(this);
        const trailModule = await import('../systems/graphics/TrailManager.js');
        const trailManager = trailModule.default;
        trailManager.init(this);

        const ghostModule = await import('../systems/graphics/GhostManager.js');
        const ghostManager = ghostModule.default;
        ghostManager.init(this);

        soundManager.init(this);
        ultimateCutsceneManager.init();

        // [신규] 투사체 매니저 초기화 및 클래스 등록 (Router)
        const projectileModule = await import('../systems/combat/ProjectileManager.js');
        const ArrowProjectile = (await import('../entities/projectiles/common/ArrowProjectile.js')).default;
        const KnockbackShotProjectile = (await import('../entities/projectiles/skills/KnockbackShotProjectile.js')).default;

        this.projectileManager = projectileModule.default;
        this.projectileManager.init(this);

        // 투사체 라우팅 등록
        this.projectileManager.registerProjectile('arrow', ArrowProjectile);
        this.projectileManager.registerProjectile('knockback_shot', KnockbackShotProjectile);

        // [전투] 스폰 매니저를 통한 초기 배치
        this.spawnManager = spawnManager;
        this.spawnManager.init(this);
        this.allies = this.spawnManager.spawnAllies(this);
        this.enemies = this.spawnManager.spawnEnemies(this, this.stageId);

        // [HUD] 초상화 허드 초기화
        portraitHUDManager.init(this, this.allies);

        Logger.info("BATTLE", `Spawned ${this.allies.length} allies and ${this.enemies.length} enemies.`);

        // [카메라] 중앙 정렬
        cameraManager.centerCamera();
    }

    update(time, delta) {
        if (this.isTransitioning) return;

        // [HUD] 초상화 허드 업데이트
        portraitHUDManager.update(time, delta);

        // [그림자] 실시간 업데이트
        shadowManager.update([...this.allies, ...this.enemies]);
        fxManager.update(time, delta); // [신규] FX 시스템 업데이트 (HP바 등)

        // [신규] 투사체 매니저 업데이트
        if (this.projectileManager) {
            // 투사체 업데이트는 그룹 내 runChildUpdate가 true이면 자동 실행되지만, 
            // 명시적으로 순서 관리가 필요할 수도 있음.
        }

        // [신규] 활성 유닛 필터링 (사망하여 풀로 돌아간 유닛 제외)
        this.allies = this.allies.filter(a => a.active);
        this.enemies = this.enemies.filter(e => e.active);

        // [레이어] Y-Sorting 및 상태 업데이트
        this.allies.forEach(a => {
            a.updateDepth();
            a.updateAttackCooldown(delta); 
        });
        this.enemies.forEach(e => {
            e.updateDepth();
            e.updateAttackCooldown(delta); 
        });

        // AI 업데이트
        if (this.aiManager) {
            this.aiManager.update(this.allies, this.enemies, delta);
        }

        // 이동 및 물리 업데이트
        if (this.movementManager) {
            this.movementManager.update([...this.allies, ...this.enemies], delta);
        }
    }
}
