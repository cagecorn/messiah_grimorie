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
 * 역할: [용병 데이터 레지스트리 및 팩토리]
 * 
 * 설명: 모든 용병의 기본 데이터(Registry)를 보유하고 있으며, 
 * 이를 기반으로 실제 게임 객체(Entity)를 생성하는 팩토리 역할을 수행합니다.
 * 더 이상 특정 용병을 하드코딩으로 지급하지 않습니다.
 */
class MercenaryManager {
    constructor() {
        // [ID 레지스트리] 핵심 데이터 정의 (하드코딩 지급 아님)
        this.registry = {
            aren, ella, sera, merlin, lute, silvi
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

        return new BaseEntity({
            ...baseData,
            ...customConfig,
            type: 'mercenary'
        });
    }
}

const mercenaryManager = new MercenaryManager();
export default mercenaryManager;
