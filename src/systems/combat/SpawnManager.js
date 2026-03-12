import Logger from '../../utils/Logger.js';
import formationManager from '../FormationManager.js';
import mercenaryManager from '../entities/MercenaryManager.js';
import monsterManager from '../entities/MonsterManager.js';
import collectionManager from '../MercenaryCollectionManager.js';
import assetPathManager from '../../core/AssetPathManager.js';
import CombatEntity from '../../entities/CombatEntity.js';

/**
 * 스폰 매니저 (Spawn Manager)
 * 역할: [유닛 배치 및 초기화]
 * 
 * 설명: 전투 시작 시 아군(편성 정보 기반)과 적군(스테이지 정보 기반)을 
 * 월드에 물리적으로 배치하는 역할을 담당합니다.
 */
class SpawnManager {
    /**
     * 아군 유닛 스폰 (편성된 유닛들)
     */
    spawnAllies(scene) {
        const formation = formationManager.getFormation();
        const spawnedUnits = [];
        
        // 유저 요청: "아렌만 들고 입장하도록 할게"
        // (실제로는 formationManager를 따르되, 아렌이 배치되어 있으면 아렌이 나옵니다)
        
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

            // 3. 물리 위치 계산 (좌측 구역)
            // 슬롯 인덱스에 따라 Y축 분산
            const x = 150 + (index % 2) * 40;
            const y = 300 + (index * 80);

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
        
        // 유저 요청: "고블린 세마리"
        const enemyIds = ['goblin', 'goblin', 'goblin'];

        enemyIds.forEach((id, index) => {
            // 1. 논리 엔티티 생성
            const logicEntity = monsterManager.spawn(id, { level: 1 });

            // 2. 물리 위치 계산 (우측 구역)
            const x = 650 + (index % 2) * 50;
            const y = 350 + (index * 100);

            // 3. 물리 엔티티 생성
            const spriteKey = `enemy_${id}_sprite`;
            const combatEntity = new CombatEntity(scene, x, y, logicEntity, spriteKey);
            
            spawnedUnits.push(combatEntity);
        });

        return spawnedUnits;
    }

    /**
     * 전투에 필요한 에셋 프리로드 리스트 제공
     */
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
}

const spawnManager = new SpawnManager();
export default spawnManager;
