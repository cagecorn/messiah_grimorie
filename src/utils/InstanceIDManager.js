import Logger from './Logger.js';

/**
 * 인스턴스 ID 매니저 (Instance ID Manager)
 * 역할: [전역 유일 식별자 생성]
 * 
 * 설명: 동일한 종류의 유닛(예: 고블린 3마리)이 생성되더라도 
 * 각각 고유한 ID를 부여하여 매니저들이 객체를 개별적으로 관리할 수 있게 합니다.
 */
class InstanceIDManager {
    constructor() {
        this.counters = new Map(); // baseId -> count
    }

    /**
     * 새로운 고유 ID 생성 (예: 'goblin_1', 'goblin_2')
     * @param {string} baseId 
     * @returns {string} uniqueId
     */
    generate(baseId) {
        const currentCount = this.counters.get(baseId) || 0;
        const nextCount = currentCount + 1;
        this.counters.set(baseId, nextCount);

        const uniqueId = `${baseId}_${nextCount}`;
        return uniqueId;
    }

    /**
     * 카운터 초기화 (스테이지 전환 시 등)
     */
    reset() {
        this.counters.clear();
        Logger.system("InstanceIDManager: Counters reset.");
    }
}

const instanceIDManager = new InstanceIDManager();
export default instanceIDManager;
