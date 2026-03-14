import Logger from '../../utils/Logger.js';
import indexDBManager from '../../core/IndexDBManager.js';

/**
 * 용병 개별 인덱스DB 매니저 기초 (Base Mercenary DB Manager)
 * 역할: [각 용병별 전용 저장소 관리 루틴]
 * 
 * 설명: 모든 개별 용병 매니저들의 공통 로직을 담고 있습니다.
 */
export default class BaseMercenaryDBManager {
    constructor(mercId) {
        this.mercId = mercId;
        this.storeName = `merc_${mercId}`;
    }

    /**
     * 해당 용병의 정보를 저장합니다.
     */
    async saveData(data) {
        try {
            // 데이터에 id가 없으면 mercId를 강제 할당 (keyPath: 'id')
            if (!data.id) data.id = this.mercId;
            await indexDBManager.save(this.storeName, data);
            // Logger.info(`DB_${this.mercId.toUpperCase()}`, `Saved progress.`);
        } catch (err) {
            Logger.error(`DB_${this.mercId.toUpperCase()}`, `Save failed: ${err.message}`);
        }
    }

    /**
     * 해당 용병의 정보를 로드합니다.
     */
    async loadData() {
        try {
            const data = await indexDBManager.load(this.storeName, this.mercId);
            return data;
        } catch (err) {
            Logger.error(`DB_${this.mercId.toUpperCase()}`, `Load failed: ${err.message}`);
            return null;
        }
    }
}
