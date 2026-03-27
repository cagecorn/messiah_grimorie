import Logger from '../../utils/Logger.js';
import BaseEntity from '../../entities/BaseEntity.js';
import instanceIDManager from '../../utils/InstanceIDManager.js';

// [데이터 로드] 초기 핵심 용병 라인업
// ... (omitted imports for brevity, but I will keep them manually or rely on tool)
import aren from '../../data/mercenaries/aren.js';
import ella from '../../data/mercenaries/ella.js';
import sera from '../../data/mercenaries/sera.js';
import merlin from '../../data/mercenaries/merlin.js';
import lute from '../../data/mercenaries/lute.js';
import silvi from '../../data/mercenaries/silvi.js';
import zayn from '../../data/mercenaries/zayn.js';
import ria from '../../data/mercenaries/ria.js';
import joojoo from '../../data/mercenaries/joojoo.js';
import sein from '../../data/mercenaries/sein.js';
import aina from '../../data/mercenaries/aina.js';
import bao from '../../data/mercenaries/bao.js';
import boon from '../../data/mercenaries/boon.js';
import king from '../../data/mercenaries/king.js';
import leona from '../../data/mercenaries/leona.js';
import nana from '../../data/mercenaries/nana.js';
import nickle from '../../data/mercenaries/nickle.js';

/**
 * 용병 매니저 (Mercenary Manager)
 * 역할: [용병 데이터 레지스트리 및 팩토리]
 */
class MercenaryManager {
    constructor() {
        // [ID 레지스트리] 핵심 데이터 정의
        this.registry = {
            aren, ella, sera, merlin, lute, silvi, zayn, ria, joojoo, sein, aina, bao, boon, king, leona, nana, nickle
        };

        Logger.system("MercenaryManager: Registry ready (Factory mode).");
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

        // 1. 고유 인스턴스 ID 생성
        const uniqueId = instanceIDManager.generate(mercId.toLowerCase());

        return new BaseEntity({
            ...baseData,
            ...customConfig,
            baseId: mercId.toLowerCase(),
            id: uniqueId,
            type: 'mercenary'
        });
    }
}

const mercenaryManager = new MercenaryManager();
export default mercenaryManager;
