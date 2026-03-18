import collectionManager from '../MercenaryCollectionManager.js';
import assetPathManager from '../../core/AssetPathManager.js';
import CombatEntity from '../../entities/CombatEntity.js';
import measurementManager from '../../core/MeasurementManager.js';
import poolingManager from '../../core/PoolingManager.js';
import formationManager from '../FormationManager.js';
import mercenaryManager from '../entities/MercenaryManager.js';
import monsterManager from '../entities/MonsterManager.js';
import dungeonRoundScalingManager from '../dungeons/DungeonRoundScalingManager.js';
import eliteMonsterManager from '../entities/EliteMonsterManager.js';
import Logger from '../../utils/Logger.js';

/**
 * 스폰 매니저 (Spawn Manager)
 * 역할: [유닛 배치 및 초기화]
 */
class SpawnManager {
    constructor() {
        this.scene = null;
    }

    /**
     * 초기화 및 풀 등록
     */
    init(scene) {
        this.scene = scene;

        // [USER 요청] 자주 쓰이는 몬스터 풀 등록
        poolingManager.registerPool('monster_goblin', () => {
            const dummyLogic = monsterManager.spawn('goblin', { level: 1 });
            const entity = new CombatEntity(scene, 0, 0, dummyLogic, 'enemy_goblin_sprite');
            entity.poolType = 'monster_goblin';
            return entity;
        }, 15, true); // [FIX] overwrite: true로 등록하여 씬 재시작 시 새로운 씬 참조로 갱신

        poolingManager.registerPool('monster_goblin_shaman', () => {
            const dummyLogic = monsterManager.spawn('goblin_shaman', { level: 1 });
            const entity = new CombatEntity(scene, 0, 0, dummyLogic, 'enemy_goblin_shaman_sprite');
            entity.poolType = 'monster_goblin_shaman';
            return entity;
        }, 10, true);

        poolingManager.registerPool('monster_goblin_wizard', () => {
            const dummyLogic = monsterManager.spawn('goblin_wizard', { level: 1 });
            const entity = new CombatEntity(scene, 0, 0, dummyLogic, 'enemy_goblin_wizard_sprite');
            entity.poolType = 'monster_goblin_wizard';
            return entity;
        }, 5, true);

        poolingManager.registerPool('monster_goblin_flyingman', () => {
            const dummyLogic = monsterManager.spawn('goblin_flyingman', { level: 1 });
            const entity = new CombatEntity(scene, 0, 0, dummyLogic, 'enemy_goblin_flyingman_sprite');
            entity.poolType = 'monster_goblin_flyingman';
            return entity;
        }, 5, true);

        // [신규] 고블린 로그 폴백 풀 등록
        poolingManager.registerPool('monster_goblin_rogue', () => {
            const dummyLogic = monsterManager.spawn('goblin_rogue', { level: 1 });
            const entity = new CombatEntity(scene, 0, 0, dummyLogic, 'enemy_goblin_rogue_sprite');
            entity.poolType = 'monster_goblin_rogue';
            return entity;
        }, 8, true);

        Logger.system("SpawnManager: Pooling registered for Goblins, Shamans, Wizards, Rogues, and Flyingmen.");
    }
    /**
     * 아군 유닛 스폰 (편성된 유닛들)
     */
    spawnAllies(scene) {
        const formation = formationManager.getFormation();
        const spawnedUnits = [];
        
        // (실제로는 formationManager를 따르되, 아렌이 배치되어 있으면 아렌이 나옵니다)
        
        const world = measurementManager.world;
        
        formation.forEach((mercId, index) => {
            if (!mercId) return;

            // 1. 보유 데이터 (레벨, 성급) 가져오기
            const ownedData = collectionManager.getMercenaryData(mercId);
            const level = ownedData ? ownedData.level : 1;
            const stars = ownedData ? ownedData.stars : 1;

            // 2. 논리 엔티티 생성
            const logicEntity = mercenaryManager.createFromRegistry(mercId, {
                level: level,
                exp: ownedData ? (ownedData.exp || 0) : 0, // [FIX] 경험치 연동 누락 수정
                stars: stars
            });

            // [FIX] 존재하지 않는 용병(예: 삭제된 바이퍼) 건너뛰기
            if (!logicEntity) {
                Logger.warn("SPAWN_MANAGER", `Skipping spawn for unknown mercenary: ${mercId}`);
                return;
            }

            // 3. 물리 위치 계산 (좌측 15% 구역)
            const x = Math.round(world.width * 0.15 + (index % 2) * 60);
            const y = Math.round(world.height * 0.3 + (index * 100));

            // 4. 물리 엔티티(CombatEntity) 생성
            const spriteKey = `merc_${mercId}_sprite`;
            const combatEntity = new CombatEntity(scene, x, y, logicEntity, spriteKey);
            
            spawnedUnits.push(combatEntity);
        });

        return spawnedUnits;
    }

    /**
     * 적군 유닛 스폰 (스테이지 설정 및 라운드 스케일링 기반)
     */
    spawnEnemies(scene, stageId, round = 1) {
        const spawnedUnits = [];
        const world = measurementManager.world;
        
        // [SCALING] 라운드에 따른 몬스터 레벨 및 마릿수 계산
        const monsterLevel = dungeonRoundScalingManager.getMonsterLevel(round);
        
        // [USER 요청] 최대 마릿수 제한 제거 (무한 스케일링)
        // 기본 10마리 + 라운드당 2마리씩 추가
        const enemyCount = 10 + (round - 1) * 2;
        
        // [USER 요청] 몬스터 ID 결정
        const monsterIds = [];
        for (let i = 0; i < enemyCount; i++) {
            const rand = Math.random();
            let id;

            if (stageId === 'cursed_forest') {
                // 저주받은 숲: 고블린 50%, 로그 15%, 샤먼 15%, 위자드 10%, 플라잉맨 10% 비율로 밸런싱
                if (rand < 0.5) id = 'goblin';
                else if (rand < 0.65) id = 'goblin_rogue'; // [신규] 고블린 로그 추가
                else if (rand < 0.8) id = 'goblin_shaman';
                else if (rand < 0.9) id = 'goblin_wizard';
                else id = 'goblin_flyingman';
            } else {
                // 기본 분배
                id = (rand < 0.6) ? 'goblin' : (rand < 0.9 ? 'goblin_shaman' : 'goblin_wizard');
            }
            monsterIds.push(id);
        }

        Logger.info("BATTLE_SPAWN", `Spawning ${enemyCount} enemies for Round ${round} (Level: ${monsterLevel})`);

        monsterIds.forEach((id, index) => {
            // 1. 논리 엔티티 설정 준비
            let spawnConfig = { level: monsterLevel };

            // 2. [ELITE] 엘리트 출현 판정 및 강화 적용
            const isElite = eliteMonsterManager.rollElite(round);
            if (isElite) {
                spawnConfig = eliteMonsterManager.applyEliteModifications(spawnConfig);
            }

            // 3. 논리 엔티티 생성
            const logicEntity = monsterManager.spawn(id, spawnConfig);

            // 2. [DIVERSE SPAWN] 물리 위치 계산 (전방위 360도 기습)
            const spawnType = Math.random();
            let x, y;

            if (spawnType < 0.4) {
                // 1. 정면 기습 (우측 - 40%)
                x = Math.round(world.width * 0.8 + Math.random() * world.width * 0.15);
                y = Math.round(Math.random() * world.height);
            } else if (spawnType < 0.65) {
                // 2. 측면 기습 (상/하단 - 25%)
                const isTop = Math.random() < 0.5;
                x = Math.round(Math.random() * world.width);
                y = isTop ? Math.round(-50 - Math.random() * 100) : Math.round(world.height + 50 + Math.random() * 100);
            } else if (spawnType < 0.8) {
                // 3. 후방 기습 (좌측 - 15%)
                // 아군이 보통 x=15% 지점에 있으므로, 그보다 더 왼쪽(0~10%)에서 등장
                x = Math.round(Math.random() * world.width * 0.1);
                y = Math.round(Math.random() * world.height);
            } else {
                // 4. 전방위 포위 (가장자리 무작위 - 20%)
                const edge = Math.floor(Math.random() * 4);
                if (edge === 0) { // Top
                    x = Math.random() * world.width; y = -50;
                } else if (edge === 1) { // Right
                    x = world.width + 50; y = Math.random() * world.height;
                } else if (edge === 2) { // Bottom
                    x = Math.random() * world.width; y = world.height + 50;
                } else { // Left
                    x = -50; y = Math.random() * world.height;
                }
            }

            // 3. 물리 엔티티 생성 (풀링 적용)
            const poolId = `monster_${id.toLowerCase()}`;
            const spriteKey = `enemy_${id}_sprite`;
            
            let combatEntity = poolingManager.get(poolId);
            
            if (combatEntity) {
                combatEntity.init(x, y, logicEntity, spriteKey);
            } else {
                combatEntity = new CombatEntity(scene, x, y, logicEntity, spriteKey);
            }
            
            spawnedUnits.push(combatEntity);
        });

        return spawnedUnits;
    }

    getRequiredAssets() {
        const assets = [];
        
        // 편성된 아군 스프라이트
        formationManager.getFormation().forEach(id => {
            if (id) {
                assets.push({
                    type: 'mercenary',
                    id: id,
                    key: `merc_${id}_sprite`,
                    path: assetPathManager.getMercenaryPath(id, 'sprite')
                });
            }
        });

        // Viper 전용 스프라이트 강제 프리로드 (기본 용병 리스트에 없을 수도 있으므로)
        assets.push({
            type: 'mercenary',
            id: 'viper',
            key: 'merc_viper_sprite',
            path: assetPathManager.getMercenaryPath('viper', 'sprite')
        });

        // [USER 요청] 고블린과 샤먼 스프라이트 프리로드
        assets.push({
            type: 'monster',
            id: 'goblin',
            key: `enemy_goblin_sprite`,
            path: assetPathManager.getEnemyPath('goblin', 'sprite')
        });

        assets.push({
            type: 'monster',
            id: 'goblin_shaman',
            key: `enemy_goblin_shaman_sprite`,
            path: assetPathManager.getEnemyPath('goblin_shaman', 'sprite')
        });

        assets.push({
            type: 'monster',
            id: 'goblin_wizard',
            key: `enemy_goblin_wizard_sprite`,
            path: assetPathManager.getEnemyPath('goblin_wizard', 'sprite')
        });

        assets.push({
            type: 'monster',
            id: 'goblin_flyingman',
            key: `enemy_goblin_flyingman_sprite`,
            path: assetPathManager.getEnemyPath('goblin_flyingman', 'sprite')
        });

        // [신규] 고블린 로그 프리로드 등록
        assets.push({
            type: 'monster',
            id: 'goblin_rogue',
            key: `enemy_goblin_rogue_sprite`,
            path: assetPathManager.getEnemyPath('goblin_rogue', 'sprite')
        });

        // [신규] 주주 토템 에셋 프리로드
        assets.push({ type: 'summon', id: 'spirit_totem', key: 'spirit_totem_sprite', path: assetPathManager.getPath('images', 'spirit_totem_sprite') });
        assets.push({ type: 'summon', id: 'fire_totem', key: 'fire_totem_sprite', path: assetPathManager.getPath('images', 'fire_totem_sprite') });
        assets.push({ type: 'summon', id: 'healing_totem', key: 'healing_totem_sprite', path: assetPathManager.getPath('images', 'healing_totem_sprite') });

        return assets;
    }

    /**
     * 현재 씬의 모든 활성 엔티티 반환
     */
    getActiveEntities(scene) {
        if (!scene) return [];
        return [...(scene.allies || []), ...(scene.enemies || [])];
    }
}

const spawnManager = new SpawnManager();
export default spawnManager;
