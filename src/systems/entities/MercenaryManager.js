import Logger from '../../utils/Logger.js';
import BaseEntity from '../../entities/BaseEntity.js';

// [데이터 로드] 초기 핵심 용병 라인업
import aren from '../../data/mercenaries/aren.js';
import ella from '../../data/mercenaries/ella.js';
import sera from '../../data/mercenaries/sera.js';
import merlin from '../../data/mercenaries/merlin.js';
import lute from '../../data/mercenaries/lute.js';
import silvi from '../../data/mercenaries/silvi.js';

/**
 * 용병 매니저 (Mercenary Manager)
 * 역할: [플레이어 소속 용병들의 생성 및 생명주기 관리]
 */
class MercenaryManager {
    constructor() {
        this.mercenaries = new Map();
        
        // [ID 관리] 데이터 불일치 방지를 위한 고정 ID 레지스트리
        this.registry = {
            aren, ella, sera, merlin, lute, silvi
        };

        Logger.system("MercenaryManager: Registry initialized with core lineup.");
    }

    /**
     * 레지스트리에서 ID를 기반으로 새로운 용병 인스턴스 생성
     */
    createFromRegistry(mercId, customConfig = {}) {
        const baseData = this.registry[mercId.toLowerCase()];
        if (!baseData) {
            Logger.error("MERCENARY_MANAGER", `ID not found in registry: ${mercId}`);
            return null;
        }

        return this.createMercenary({ ...baseData, ...customConfig });
    }

    /**
     * 새로운 용병 생성
     */
    createMercenary(config) {
        const merc = new BaseEntity({
            ...config,
            type: 'mercenary'
        });
        this.mercenaries.set(merc.id, merc);
        return merc;
    }

    getMercenary(id) {
        return this.mercenaries.get(id);
    }

    getAll() {
        return Array.from(this.mercenaries.values());
    }
}

const mercenaryManager = new MercenaryManager();
export default mercenaryManager;
