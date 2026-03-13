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

        // [SHADOW] 그림자 시스템 시작
        this.allies.forEach(a => shadowManager.createShadow(this, a));
        this.enemies.forEach(e => shadowManager.createShadow(this, e));

        // [GRAPHICS] 시각 효과 적용
        await graphicManager.initialize();
        graphicManager.applySceneFX(this);

        // 전역 이벤트 알림
        EventBus.emit(EVENTS.SCENE_CHANGED, 'BattleScene');
    }

    async initializeManagers() {
        try {
            // 스폰 매니저
            const spawnModule = await import('../systems/combat/SpawnManager.js');
            this.spawnManager = spawnModule.default;
            
            // 이동 매니저
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

    spawnInitialUnits() {
        if (!this.spawnManager) return;

        // [그래픽] 그래픽 시스템 초기화
        fxManager.init(this);
        animationManager.init(this);

        // [전투] 스폰 매니저를 통한 초기 배치
        this.spawnManager = spawnManager;
        this.allies = this.spawnManager.spawnAllies(this);
        this.enemies = this.spawnManager.spawnEnemies(this, this.stageId);

        Logger.info("BATTLE", `Spawned ${this.allies.length} allies and ${this.enemies.length} enemies.`);

        // [카메라] 중앙 정렬
        cameraManager.centerCamera();
    }

    update(time, delta) {
        if (this.isTransitioning) return;

        // [카메라] 아군 추적
        cameraManager.updateFollowAllies(this, this.allies, delta);

        // [그림자] 실시간 업데이트
        shadowManager.update([...this.allies, ...this.enemies]);
        fxManager.update(time, delta); // [신규] FX 시스템 업데이트 (HP바 등)

        // [레이어] Y-Sorting 및 상태 업데이트
        this.allies.forEach(a => {
            a.updateDepth();
            a.updateAttackCooldown(delta); // [신규] 쿨다운 업데이트
        });
        this.enemies.forEach(e => {
            e.updateDepth();
            e.updateAttackCooldown(delta); // [신규] 쿨다운 업데이트
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
