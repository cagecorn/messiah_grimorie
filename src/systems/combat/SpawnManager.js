import collectionManager from '../MercenaryCollectionManager.js';
import assetPathManager from '../../core/AssetPathManager.js';
import CombatEntity from '../../entities/CombatEntity.js';
import measurementManager from '../../core/MeasurementManager.js';
import poolingManager from '../../core/PoolingManager.js';
import formationManager from '../FormationManager.js';
import mercenaryManager from '../entities/MercenaryManager.js';
import monsterManager from '../entities/MonsterManager.js';
import dungeonRoundScalingManager from '../dungeons/DungeonRoundScalingManager.js';
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
        }, 15);

        poolingManager.registerPool('monster_goblin_shaman', () => {
            const dummyLogic = monsterManager.spawn('goblin_shaman', { level: 1 });
            const entity = new CombatEntity(scene, 0, 0, dummyLogic, 'enemy_goblin_shaman_sprite');
            entity.poolType = 'monster_goblin_shaman';
            return entity;
        }, 10);

        Logger.system("SpawnManager: Pooling registered for Goblins and Shamans.");
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
                stars: stars
            });

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
        
        // [USER 요청] 몬스터 ID 결정 (고블린 7 : 고블린 샤먼 3 비율)
        const monsterIds = [];
        for (let i = 0; i < enemyCount; i++) {
            // 7:3 비율로 고블린과 샤먼 분배
            const id = (Math.random() < 0.7) ? 'goblin' : 'goblin_shaman';
            monsterIds.push(id);
        }

        Logger.info("BATTLE_SPAWN", `Spawning ${enemyCount} enemies for Round ${round} (Level: ${monsterLevel})`);

        monsterIds.forEach((id, index) => {
            // 1. 논리 엔티티 생성 (레벨 적용)
            const logicEntity = monsterManager.spawn(id, { level: monsterLevel });

            // 2. [DIVERSE SPAWN] 물리 위치 계산 (출현 각도 다양화)
            const spawnType = Math.random();
            let x, y;

            if (spawnType < 0.6) {
                // 1. 우측 (정면 출현 - 60%)
                x = Math.round(world.width * 0.85 - (index % 5) * 60 + (Math.random() - 0.5) * 200);
                y = Math.round(world.height * 0.2 + (index * 40) + (Math.random() - 0.5) * 100);
            } else if (spawnType < 0.8) {
                // 2. 상단 (우측 상단 기습 - 20%)
                x = Math.round(world.width * 0.6 + (Math.random() * world.width * 0.3));
                y = Math.round(world.height * 0.1 - (Math.random() * 100));
            } else {
                // 3. 하단 (우측 하단 기습 - 20%)
                x = Math.round(world.width * 0.6 + (Math.random() * world.width * 0.3));
                y = Math.round(world.height * 0.9 + (Math.random() * 100));
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
