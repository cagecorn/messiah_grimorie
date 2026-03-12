import indexDBManager from '../../core/IndexDBManager.js';
import Logger from '../../utils/Logger.js';

/**
 * 편성 DB 매니저 (Formation DB Manager)
 * 역할: [편성 데이터의 영구 저장 및 로드]
 * 
 * 설명: IndexedDB의 'formations' 스토어를 관리하는 전용 매니저입니다.
 * 'primary_party' 등의 키로 슬롯 정보를 저장하고 불러옵니다.
 */
class FormationDBManager {
    constructor() {
        this.storeName = 'formations';
    }

    /**
     * 특정 ID로 편성 정보 저장
     * @param {string} id 
     * @param {Array} formation 
     */
    async saveFormation(id, formation) {
        try {
            await indexDBManager.save(this.storeName, {
                id: id,
                slots: formation,
                updatedAt: Date.now()
            });
            Logger.info("FORMATION_DB", `Formation '${id}' saved to DB.`);
        } catch (error) {
            Logger.error("FORMATION_DB", `Failed to save formation: ${error.message}`);
        }
    }

    /**
     * 특정 ID의 편성 정보 로드
     * @param {string} id 
     */
    async loadFormation(id) {
        try {
            const data = await indexDBManager.load(this.storeName, id);
            if (data && data.slots) {
                Logger.info("FORMATION_DB", `Formation '${id}' loaded from DB.`);
                return data.slots;
            }
            return null;
        } catch (error) {
            Logger.error("FORMATION_DB", `Failed to load formation: ${error.message}`);
            return null;
        }
    }
}

const formationDBManager = new FormationDBManager();
export default formationDBManager;
