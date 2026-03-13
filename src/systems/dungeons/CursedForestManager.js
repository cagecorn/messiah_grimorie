import Logger from '../../utils/Logger.js';
import assetPathManager from '../../core/AssetPathManager.js';

/**
 * 저주받은 숲 매니저 (Cursed Forest Manager)
 * 역할: [저주받은 숲 던전의 레벨 구성, 몬스터 스폰, 맵 정보 관리]
 */
class CursedForestManager {
    constructor() {
        this.id = 'cursed_forest';
        this.name = 'Cursed Forest';
        this.nameKey = 'dungeon_cursed_forest_name';
        
        // 맵 물리 크기 설정
        // 유저 요청: 100개 이상의 유닛 물리 충돌 여유 공간 확보
        // 배경 이미지 (1536x1024)를 타일링하거나 확장을 고려하여 넉넉히 설정
        this.mapConfig = {
            width: 3000,
            height: 2000,
            bgKey: 'battle_forest_bg'
        };

        this.waves = [
            { monsters: ['goblin'], count: 10 },
            { monsters: ['goblin', 'goblin_shaman'], count: 15 }
        ];

        Logger.system(`CursedForestManager: Stage ${this.name} Ready.`);
    }

    getMapConfig() {
        return this.mapConfig;
    }
}

const cursedForestManager = new CursedForestManager();
export default cursedForestManager;
