import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';
import indexDBManager from '../core/IndexDBManager.js';

/**
 * 용병 수집 매니저 (Mercenary Collection Manager)
 * 역할: [소유권 및 컬렉션 데이터 관리]
 * 
 * 설명: 유저가 어떤 용병을 몇 장 가지고 있는지, 레벨/성은 얼마인지 기록합니다.
 * DB와 실시간 동기화되며, 하드코딩 없이 시스템적으로 용병을 추가/조회합니다.
 */
class MercenaryCollectionManager {
    constructor() {
        this.ownedMercenaries = new Map(); // key: id, value: { id, level, stars, count, ... }
        this.isInitialized = false;
    }

    /**
     * 초기화 (DB에서 데이터 로드)
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            const data = await indexDBManager.getAll('mercenaries');
            data.forEach(merc => {
                this.ownedMercenaries.set(merc.id.toLowerCase(), merc);
            });
            this.isInitialized = true;
            Logger.system(`MercenaryCollectionManager: Initialized (${this.ownedMercenaries.size} owned).`);
            EventBus.emit('COLLECTION_LOADED', { count: this.ownedMercenaries.size });
        } catch (err) {
            Logger.error("COLLECTION_MANAGER", `Initialization failed: ${err.message}`);
        }
    }

    /**
     * 용병 획득 (가챠나 스타터팩)
     */
    async addMercenary(mercId, amount = 1) {
        const id = mercId.toLowerCase();
        let merc = this.ownedMercenaries.get(id);

        if (merc) {
            merc.count += amount;
        } else {
            // 신규 획득
            merc = {
                id: id,
                level: 1,
                stars: 1,
                count: amount,
                acquiredAt: Date.now()
            };
        }

        this.ownedMercenaries.set(id, merc);
        await indexDBManager.save('mercenaries', merc);
        
        Logger.info("COLLECTION", `Acquired/Updated mercenary: ${id} (Total: ${merc.count})`);
        EventBus.emit('COLLECTION_UPDATED', { mercId: id, data: merc });
    }

    /**
     * 소유 여부 확인
     */
    isOwned(mercId) {
        return this.ownedMercenaries.has(mercId.toLowerCase());
    }

    /**
     * 보유 리스트 반환
     */
    getOwnedList() {
        return Array.from(this.ownedMercenaries.values());
    }

    /**
     * 특정 용병 데이터 반환
     */
    getMercenaryData(mercId) {
        return this.ownedMercenaries.get(mercId.toLowerCase());
    }
}

const mercenaryCollectionManager = new MercenaryCollectionManager();
export default mercenaryCollectionManager;
