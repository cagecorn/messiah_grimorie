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
        Logger.system("ItemManager Router: Initialized (Item metadata hub ready).");
    }

    /**
     * 아이템 정의 등록
     * @param {string} id 아이템 식별자
     * @param {object} config 아이템 설정 (이름, 설명, 스탯 등)
     */
    registerItem(id, config) {
        // Registry를 통해 대소문자 구분 없이 관리
        Registry.register('items', id, config);
        Logger.info("ITEM_ROUTER", `Item registered: ${id}`);
    }

    /**
     * 아이템 정보 조회 라우팅
     */
    getItem(id) {
        return Registry.get('items', id);
    }

    /**
     * 아이템 사용 요청 라우팅
     */
    useItem(actor, itemId) {
        const item = this.getItem(itemId);
        if (!item) {
            Logger.warn("ITEM_ROUTER", `Unknown item use requested: ${itemId}`);
            return false;
        }

        Logger.info("ITEM_ROUTER", `Routing item use: ${itemId} by ${actor.id || 'Unknown'}`);
        // [TODO] 아이템 타입별 사용 로직 분기 (Consumable, Equipment 등)
        return true;
    }
}

const itemManager = new ItemManager();
export default itemManager;
