import Logger from '../utils/Logger.js';
import indexDBManager from '../core/IndexDBManager.js';
import EventBus, { EVENTS } from '../core/EventBus.js';

/**
 * 용병 보유 현황 매니저 (Mercenary Collection Manager)
 * 역할: [보유 용병 데이터 관리 및 영구 저장]
 * 
 * 설명: 인덱스DB와 연동하여 뽑은 용병의 개수를 저장하고 관리합니다.
 */
class MercenaryCollectionManager {
    constructor() {
        this.collection = new Map(); // id -> count
        this.tableName = 'mercenary_collection';
        Logger.system("MercenaryCollectionManager: Initialized.");
    }

    async load() {
        try {
            const data = await indexDBManager.get(this.tableName, 'all');
            if (data) {
                data.forEach(item => {
                    this.collection.set(item.id, item.count);
                });
            }
            Logger.info("COLLECTION", "Mercenary collection loaded from IndexDB.");
            EventBus.emit('COLLECTION_LOADED');
        } catch (err) {
            Logger.error("COLLECTION", `Failed to load collection: ${err.message}`);
        }
    }

    /**
     * 용병 획득 처리
     * @param {string} unitId 
     */
    async addMercenary(unitId) {
        const currentCount = this.collection.get(unitId) || 0;
        const newCount = currentCount + 1;
        this.collection.set(unitId, newCount);

        // DB 저장
        await indexDBManager.put(this.tableName, { id: unitId, count: newCount });
        
        Logger.info("COLLECTION", `Mercenary added: ${unitId} (Total: ${newCount})`);
        EventBus.emit('COLLECTION_UPDATED', { id: unitId, count: newCount });
    }

    getCount(unitId) {
        return this.collection.get(unitId) || 0;
    }

    getAll() {
        return Array.from(this.collection.entries()).map(([id, count]) => ({ id, count }));
    }
}

const mercenaryCollectionManager = new MercenaryCollectionManager();
export default mercenaryCollectionManager;
