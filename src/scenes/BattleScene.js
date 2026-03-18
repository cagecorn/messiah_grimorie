import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import EventBus, { EVENTS } from '../core/EventBus.js';
import spawnManager from '../systems/combat/SpawnManager.js';
import combatManager from '../systems/CombatManager.js';
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
import experienceManager from '../systems/combat/ExperienceManager.js';
import lootManager from '../systems/combat/LootManager.js';
import lootInteractionManager from '../systems/combat/LootInteractionManager.js';
import dungeonRoundManager from '../systems/dungeons/DungeonRoundManager.js';
import timeManager from '../core/TimeManager.js';

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
        this.roundTimer = null;
        this.isTransitioning = false; // [신규] 명시적 초기화
        
        // [라운드 안전장치 용]
        this.currentRoundTotalSpawns = 0;
        this.currentRoundDeathCount = 0;
    }

    init(data) {
        this.stageId = data.stageId || 'cursed_forest';
        this.isTransitioning = false; // [FIX] 재시작 시 플래그 반드시 초기화
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
        this.load.image('explosion_effect', assetPathManager.getPath('images', 'explosion_effect'));
        this.load.image('aqua_burst_projectile', assetPathManager.getPath('images', 'aqua_burst_projectile'));
        this.load.image('aqua_explosion_effect', assetPathManager.getPath('images', 'aqua_explosion_effect'));
        this.load.image('fire_burst_projectile', assetPathManager.getPath('images', 'fire_burst_projectile'));
        this.load.image('fire_explosion_effect', assetPathManager.getPath('images', 'fire_explosion_effect'));
        this.load.image('cloning_effect', assetPathManager.getPath('images', 'cloning_effect'));
        this.load.image('ice_ball_projectile', 'assets/effect/ice_ball_projectile.png');
        this.load.image('ice_explosion_effect', 'assets/effect/ice_explosion_effect.png');
        this.load.image('ice_storm_cloud', 'assets/effect/ice_storm_cloud.png');
        this.load.image('ice_storm_projectile', 'assets/effect/ice_storm_projectile.png');

        // [신규] 상태 이상 아이콘 프리로드 (키값을 텍스처 키로 사용)
        const statusIcons = ['knockback', 'airborne', 'stunned', 'burned', 'invincible'];
        statusIcons.forEach(id => {
            const path = assetPathManager.getPath('images', id);
            if (path) this.load.image(id, path);
        });

        Logger.info("BATTLE_LOADER", "Preloading physical impact effects, skill assets, projectiles, and status icons.");

        // 4. [신규] 타격 효과음 프리로드
        this.load.audio('hit_phys_1', 'assets/sfx/hitting-1.mp3');
        this.load.audio('hit_phys_2', 'assets/sfx/hitting-2.mp3');
        this.load.audio('hit_phys_3', 'assets/sfx/hitting-3.mp3');
        this.load.audio('unit_fallen', 'assets/sfx/fallen-1.mp3');
        this.load.audio('arrow_1', 'assets/sfx/arrow_1.mp3');
        this.load.audio('music_hit', 'assets/sfx/music_hit.mp3');
        this.load.audio('magic_hit_1', 'assets/sfx/magic-hit-1.mp3');
        this.load.audio('explosive_1', 'assets/sfx/explosive-1.mp3');
        Logger.info("BATTLE_LOADER", "Preloading hitting sound effects and death sfx.");

        // [신규] 버프 아이콘 프리로드 (키값을 텍스처 키로 사용)
        const buffIcons = ['shield_icon', 'inspiration_icon', 'sleep_icon'];
        buffIcons.forEach(key => {
            const path = assetPathManager.getPath('images', key);
            if (path) this.load.image(key, path);
        });
    }

    async create() {
        Logger.system(`BattleScene: Started (${this.stageId})`);
        
        // 라운드 초기화 (이미 1이면 유지, 전사 시 1로 강제됨)
        const round = dungeonRoundManager.getCurrentRound() || 1;
        dungeonRoundManager.setCurrentRound(round);
        EventBus.emit('ROUND_STARTED', { round: round }); // [HUD 동기화]
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

        // [FIX] 전사 후 재시작 시 멈춰있던 물리 엔진 및 전역 시간 재개
        this.physics.resume();
        timeManager.resume();

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
            
            // [사망 리스너 해제]
            if (this.onEntityDied) {
                EventBus.off(EVENTS.ENTITY_DIED, this.onEntityDied);
                this.onEntityDied = null;
            }

            combatManager.clear(); 
            shadowManager.cleanup(); 
            portraitHUDManager.clear();
            Logger.info("BATTLE", "BattleScene shutdown: Managers and listeners cleared.");
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

            // [신규] 토템 매니저 초기화
            const totemModule = await import('../systems/entities/TotemManager.js');
            this.totemManager = totemModule.default;
            this.totemManager.init(this);

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

        // [신규] 보상 시스템 매니저 초기화 (이벤트 기반 작동 시작)
        experienceManager.init();
        lootManager.init(this);

        // [신규] 투사체 매니저 초기화 및 클래스 등록 (Router)
        const projectileModule = await import('../systems/combat/ProjectileManager.js');
        const ArrowProjectile = (await import('../entities/projectiles/common/ArrowProjectile.js')).default;
        const KnockbackShotProjectile = (await import('../entities/projectiles/skills/KnockbackShotProjectile.js')).default;

        this.projectileManager = projectileModule.default;
        this.projectileManager.init(this);

        // 투사체 라우팅 등록
        this.projectileManager.registerProjectile('arrow', ArrowProjectile);
        this.projectileManager.registerProjectile('knockback_shot', KnockbackShotProjectile);
        
        // [신규] 세이렌 투사체 등록
        const AquaBurstProjectile = (await import('../entities/projectiles/common/AquaBurstProjectile.js')).default;
        this.projectileManager.registerProjectile('aqua_burst', AquaBurstProjectile);

        // [신규] 파이어 버스트 투사체 등록
        const FireBurstProjectile = (await import('../entities/projectiles/skills/FireBurstProjectile.js')).default;
        this.projectileManager.registerProjectile('fire_burst', FireBurstProjectile);

        // [전투] 스폰 매니저를 통한 초기 배치
        this.spawnManager = spawnManager;
        this.spawnManager.init(this);
        this.allies = this.spawnManager.spawnAllies(this);
        this.enemies = this.spawnManager.spawnEnemies(this, this.stageId);

        // [라운드 안전장치] 스폰 수 기록
        this.currentRoundTotalSpawns = this.enemies.length;
        this.currentRoundDeathCount = 0;

        // [사망 추적 리스너]
        this.onEntityDied = (entity) => {
            if (entity && (entity.team === 'enemy' || entity.team === 'monster')) {
                this.currentRoundDeathCount++;
                Logger.info("ROUND_SAFEGUARD", `Monster died. Progress: ${this.currentRoundDeathCount}/${this.currentRoundTotalSpawns}`);
                
                // 즉시 체크 (안전장치)
                // [FIX] 스폰된 몬스터가 0명인 유도 라운드(또는 버그성 0명)에서는 세이프가드 작동 방지
                if (this.currentRoundTotalSpawns > 0 && this.currentRoundDeathCount >= this.currentRoundTotalSpawns) {
                     Logger.info("ROUND_SAFEGUARD", "FORCED ROUND CLEAR: All spawned monsters are confirmed dead.");
                     this.startIntermission();
                }
            }
        };
        EventBus.on(EVENTS.ENTITY_DIED, this.onEntityDied);

        // [HUD] 초상화 허드 초기화
        portraitHUDManager.init(this, this.allies);

        Logger.info("BATTLE", `Spawned ${this.allies.length} allies and ${this.enemies.length} enemies.`);

        // [카메라] 중앙 정렬
        cameraManager.centerCamera();
    }

    update(time, delta) {
        if (this.isTransitioning) return;

        // [SYSTEM] 컴뱃 매니저 업데이트 (공간 격자 갱신 및 그룹 중심점 계산)
        combatManager.update(delta);

        // [HUD] 초상화 허드 업데이트
        portraitHUDManager.update(time, delta);

        // [그림자] 실시간 업데이트 (매니저가 내부 맵을 전수 조사하여 누락 없이 관리함)
        shadowManager.update();
        fxManager.update(time, delta); // [신규] FX 시스템 업데이트 (HP바 등)

        // [신규] 투사체 매니저 업데이트
        if (this.projectileManager) {
            this.projectileManager.update(time, delta);
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

        // 2. AI 업데이트 (살아있는 엔티티만 전달하여 유령 타겟팅 및 혼란스러운 로그 방지)
        const activeAlliesForAI = this.allies.filter(a => a.active && a.logic?.isAlive);
        const activeEnemiesForAI = this.enemies.filter(e => e.active && e.logic?.isAlive);
        if (this.aiManager) {
            this.aiManager.update(activeAlliesForAI, activeEnemiesForAI, delta);
        }

        // 이동 및 물리 업데이트
        if (this.movementManager) {
            this.movementManager.update([...this.allies, ...this.enemies], delta);
        }

        // [신규] 아이템 획득 인터랙션 업데이트
        lootInteractionManager.update();

        // [신규] 패배 조건 체크 (모든 아군 전사 시)
        this.checkGameOver();

        // [ROUND CONTROL] 라운드 종료 체크
        this.checkRoundProgression();
    }

    /**
     * [신규] 패배 조건 체크 및 라운드 초기화
     */
    checkGameOver() {
        if (this.isTransitioning || this.isIntermission) return;

        // 살아있는 아군이 한 명도 없을 때
        const aliveAllies = this.allies.filter(a => a.active && a.logic?.isAlive);
        
        if (this.allies.length > 0 && aliveAllies.length === 0) {
            Logger.warn("BATTLE", "All allies defeated! Resetting to Round 1.");
            
            // [USER 요청] 1라운드로 초기화
            dungeonRoundManager.setCurrentRound(1);
            EventBus.emit('ROUND_STARTED', { round: 1 }); // HUD 즉시 갱신
            
            this.isTransitioning = true;
            
            // [FIX] 모든 물리 및 타이머 중지
            this.physics.pause();
            
            this.time.delayedCall(1500, () => {
                Logger.info("BATTLE", "Restarting scene...");
                this.scene.restart({ stageId: this.stageId });
            });
        }
    }

    /**
     * 라운드 종료 및 다음 라운드 준비 체크
     */
    checkRoundProgression() {
        if (this.isIntermission) return;

        // 모든 적 처치 시 라운드 클리어 (logic이 없거나, 죽었거나, HP가 0인 적들은 제외)
        const activeEnemies = this.enemies.filter(e => {
            if (!e.active) return false;
            if (!e.logic) return false; // 논리 데이터가 없으면 유동적 타겟으로 간주하지 않음
            return !e.logic.isDead && e.logic.hp > 0;
        });
        
        if (activeEnemies.length === 0) {
            Logger.info("ROUND_DEBUG", "No active enemies found. Starting intermission.");
            this.startIntermission();
        } else {
            // [DEBUG] 왜 라운드가 안 끝나는지 체크
            const firstActive = activeEnemies[0];
            if (this.time.now % 1000 < 50) { // 로그 폭발 방지 (약 1초마다 출력)
                Logger.info("ROUND_DEBUG", `Active Enemies: ${activeEnemies.length}. Example: ${firstActive.logic?.name} (HP: ${firstActive.logic?.hp}, isDead: ${firstActive.logic?.isDead})`);
            }
        }
    }

    /**
     * 라운드 사이 쉬는 시간 (Intermission)
     */
    startIntermission() {
        if (this.isIntermission || this.isTransitioning) return;
        this.isIntermission = true;
        Logger.info("ROUND_DEBUG", "startIntermission entered.");
        
        try {
            const currentRound = dungeonRoundManager.getCurrentRound();
            Logger.info("ROUND_DEBUG", `Current Round: ${currentRound}`);
            
            Logger.info("BATTLE", `Round ${currentRound} Cleared! Waiting for next round...`);
            EventBus.emit('ROUND_CLEARED', { round: currentRound });

            Logger.info("ROUND_DEBUG", "Event ROUND_CLEARED emitted.");

            // 최고 기록 갱신 체크
            dungeonRoundManager.updateRecord(this.stageId, currentRound);
            Logger.info("ROUND_DEBUG", "Record updated.");

            // 3초 후 다음 라운드 시작
            Logger.info("ROUND_DEBUG", "Starting timer for next round...");
            this.time.delayedCall(3000, () => {
                Logger.info("ROUND_DEBUG", "Timer finished, calling startNextRound.");
                this.startNextRound();
            });
        } catch (err) {
            Logger.error("ROUND_ERROR", `Failed during intermission: ${err.message}`);
            console.error(err);
        }
    }

    /**
     * 다음 라운드 시작
     */
    startNextRound() {
        const nextRound = dungeonRoundManager.getCurrentRound() + 1;
        dungeonRoundManager.setCurrentRound(nextRound);
        
        Logger.info("BATTLE", `Starting Round ${nextRound}...`);
        
        // 새로운 적 스폰
        const newEnemies = this.spawnManager.spawnEnemies(this, this.stageId, nextRound);
        this.enemies.push(...newEnemies);
        
        // [라운드 안전장치] 초기화
        this.currentRoundTotalSpawns = newEnemies.length;
        this.currentRoundDeathCount = 0;

        this.isIntermission = false;
        EventBus.emit('ROUND_STARTED', { round: nextRound });
    }
}
