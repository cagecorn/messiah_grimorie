import Logger from '../../utils/Logger.js';
import formationManager from '../FormationManager.js';
import mercenaryManager from '../entities/MercenaryManager.js';
import monsterManager from '../entities/MonsterManager.js';
import collectionManager from '../MercenaryCollectionManager.js';
import assetPathManager from '../../core/AssetPathManager.js';
import CombatEntity from '../../entities/CombatEntity.js';
import measurementManager from '../../core/MeasurementManager.js';
import poolingManager from '../../core/PoolingManager.js';

/**
 * 스폰 매니저 (Spawn Manager)
 * 역할: [유닛 배치 및 초기화]
 * 
 * 설명: 전투 시작 시 아군(편성 정보 기반)과 적군(스테이지 정보 기반)을 
 * 월드에 물리적으로 배치하는 역할을 담당합니다.
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

        // [USER 요청] 고블린 등 자주 쓰이는 몬스터 풀 등록
        // 초기 10마리 확보 (부족하면 자동 생성됨)
        poolingManager.registerPool('monster_goblin', () => {
            // 팩토리 함수에서는 가짜 데이터를 넣어서 생성만 해둠 (실제 초기화는 spawn 시기에 호출)
            const dummyLogic = monsterManager.spawn('goblin', { level: 1 });
            const entity = new CombatEntity(scene, 0, 0, dummyLogic, 'enemy_goblin_sprite');
            entity.poolType = 'monster_goblin';
            return entity;
        }, 10);

        Logger.system("SpawnManager: Pooling registered for common monsters.");
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
     * 적군 유닛 스폰 (스테이지 설정 기반)
     */
    spawnEnemies(scene, stageId) {
        const spawnedUnits = [];
        
        const world = measurementManager.world;
        
        // 유저 요청: 고블린 10마리 스폰
        const enemyIds = Array(10).fill('goblin');

        enemyIds.forEach((id, index) => {
            // 1. 논리 엔티티 생성
            const logicEntity = monsterManager.spawn(id, { level: 1 });

            // 2. 물리 위치 계산 (우측 85% 구역)
            const x = Math.round(world.width * 0.85 - (index % 2) * 60);
            const y = Math.round(world.height * 0.35 + (index * 120));

            // 3. 물리 엔티티 생성 (풀링 적용)
            const poolId = `monster_${id.toLowerCase()}`;
            const spriteKey = `enemy_${id}_sprite`;
            
            let combatEntity = poolingManager.get(poolId);
            
            if (combatEntity) {
                combatEntity.init(x, y, logicEntity, spriteKey);
            } else {
                // 풀이 없거나 고갈된 경우 새로 생성
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

        // 스테이지 적군 스프라이트 (고블린 고정 우선)
        assets.push({
            type: 'monster',
            id: 'goblin',
            key: `enemy_goblin_sprite`,
            path: assetPathManager.getEnemyPath('goblin', 'sprite')
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
