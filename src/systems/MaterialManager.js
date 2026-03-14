import Logger from '../utils/Logger.js';
import itemManager from '../core/ItemManager.js';

/**
 * 재료 매니저 (Material Manager)
 * 역할: [재료 아이템 데이터뱅크]
 * 
 * 설명: 수십 가지의 제작/강화용 재료 아이템들을 정의하고 관리합니다.
 * 초기화 시 ItemManager에 해당 데이터들을 등록합니다.
 */
class MaterialManager {
    constructor() {
        this.materials = {
            'log': {
                name: '🪵 Log',
                description: 'A basic wood material for crafting.',
                icon: '🪵',
                type: 'MATERIAL'
            },
            'stone': {
                name: '🪨 Stone',
                description: 'Common stone for building and weapons.',
                icon: '🪨',
                type: 'MATERIAL'
            }
            // 향후 여기에 수십개의 재료 추가 예정
        };
    }

    /**
     * 초기화: ItemManager에 재료 데이터 벌크 등록
     */
    initialize() {
        Logger.info("MATERIAL", "Initializing material database...");
        
        for (const [id, config] of Object.entries(this.materials)) {
            itemManager.registerItem(id, config);
        }
        
        Logger.system("MaterialManager: All base materials linked to ItemManager.");
    }
    
    /**
     * 특정 재료의 상세 정보 조회
     */
    getMaterial(id) {
        return this.materials[id];
    }
}

const materialManager = new MaterialManager();
export default materialManager;
