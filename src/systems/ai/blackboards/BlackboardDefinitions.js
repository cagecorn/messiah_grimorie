/**
 * 블랙보드 베이스 (Blackboard Base)
 * 역할: 데이터 저장 및 공유를 위한 단순 Key-Value 저장소
 */
class BaseBlackboard {
    constructor() {
        this.data = new Map();
    }

    set(key, value) {
        this.data.set(key, value);
    }

    get(key) {
        return this.data.get(key);
    }

    has(key) {
        return this.data.has(key);
    }

    clear() {
        this.data.clear();
    }
}

/**
 * AI 전용 블랙보드 (AI Blackboard)
 * 용도: 이동 대상, 타겟팅 정보, 현재 상태 관리
 */
export class AIBlackboard extends BaseBlackboard {
    constructor() {
        super();
        this.set('target', null);          // 현재 타겟 엔티티
        this.set('moveTarget', null);      // 이동 목적지 {x, y}
        this.set('state', 'idle');         // 현재 AI 상태 (idle, move, attack, flee)
    }
}

/**
 * 전투 전용 블랙보드 (Combat Blackboard)
 * 용도: 위협 수도(Aggro), 스킬 쿨타임, 버프 상태 등
 */
export class CombatBlackboard extends BaseBlackboard {
    constructor() {
        super();
        this.set('aggroTable', new Map()); // { entityId: threatValue }
        this.set('skillCooldowns', {});    // { skillId: timestamp }
    }
}
