import Logger from '../utils/Logger.js';
import Registry from './Registry.js';

/**
 * 아이템 매니저 (Item Manager)
 * 역할: [라우터 (Router) & 아이템 데이터 허브]
 * 
 * 설명: 월드에 존재하는 모든 아이템의 정의, 스탯, 메타데이터를 총괄하는 라우터입니다.
 * 아이템의 실제 효과 연산이나 상세 정보 조회 요청을 하위 모듈로 배분합니다.
 */
class ItemManager {
    constructor() {
        this.itemDefinitions = new Map();
        this.initDefaultItems();
        Logger.system("ItemManager Router: Initialized (Item metadata hub ready).");
    }

    /**
     * 기본 아이템 공식 등록
     */
    /**
     * 기본 아이템 공식 등록 (절대 변하지 않는 시스템 재화 등)
     */
    initDefaultItems() {
        this.registerItem('gold', {
            name: 'Gold',
            description: 'Standard currency used in Messiah Grimoire.',
            icon: '🪙',
            type: 'CURRENCY'
        });

        this.registerItem('diamond', {
            name: 'Diamond',
            description: 'Rare premium currency.',
            icon: '💎',
            type: 'CURRENCY'
        });
        
        // 'log' 등은 MaterialManager에서 등록하도록 유도함 (Hardcode-Free)
    }

    /**
     * 아이템 정의 등록
     * @param {string} id 아이템 식별자
     * @param {object} config 아이템 설정 (이름, 설명, 스탯 등)
     */
    registerItem(id, config) {
        // 이미 등록된 아이템인지 확인 (중복 방지)
        if (Registry.items.has(id)) {
            Logger.warn("ITEM_ROUTER", `Item ID '${id}' is already registered. Skipping.`);
            return;
        }
        
        Registry.items.register(id, config);
        Logger.info("ITEM_ROUTER", `Item officially registered: ${id}`);
    }
}

const itemManager = new ItemManager();
export default itemManager;
