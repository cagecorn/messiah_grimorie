import Logger from '../../utils/Logger.js';

/**
 * 데미지 계산 매니저 (Damage Calculation Manager)
 * 역할: [전투 통계 추적 및 레벨링 데이터 제공]
 * 
 * 설명: 
 * 1. 실시간 DPS(Damage Per Second) 계산
 * 2. 개별 유닛의 누적 준 데미지(Total Dealt), 받은 데미지(Total Received) 추적
 * 3. 장비 경험치 시스템의 기초 데이터 제공
 */
class DamageCalculationManager {
    constructor() {
        this.stats = new Map(); // EntityID -> { dealt: 0, received: 0, dps: 0, history: [] }
    }

    /**
     * 엔티티 통계 초기화
     */
    initEntity(entityId) {
        if (!this.stats.has(entityId)) {
            this.stats.set(entityId, {
                dealt: 0,
                received: 0,
                dps: 0,
                history: [], // { timestamp: number, amount: number }
                // [신규] 속성별 세부 통계
                dealtByElement: { physical: 0, magic: 0, fire: 0, ice: 0, lightning: 0 },
                receivedByElement: { physical: 0, magic: 0, fire: 0, ice: 0, lightning: 0 }
            });
        }
    }

    /**
     * 데미지 기록 (공격자와 피격자 모두 기록)
     */
    recordDamage(attacker, target, amount, type = 'physical') {
        if (!attacker || !target) return;

        this.initEntity(attacker.id);
        this.initEntity(target.id);

        const attackerStats = this.stats.get(attacker.id);
        const targetStats = this.stats.get(target.id);

        // 1. 누적 데이터 기록 (전체)
        attackerStats.dealt += amount;
        targetStats.received += amount;

        // 2. [신규] 속성별 데이터 기록
        if (attackerStats.dealtByElement[type] !== undefined) {
            attackerStats.dealtByElement[type] += amount;
        }
        if (targetStats.receivedByElement[type] !== undefined) {
            targetStats.receivedByElement[type] += amount;
        }

        // 3. DPS 계산을 위한 공격자 히스토리 기록
        attackerStats.history.push({
            timestamp: Date.now(),
            amount: amount,
            type: type // 타입도 히스토리에 포함 (필요 시 확장용)
        });

        // [신규] 장비 경험치 동기화 (총합 데이터가 필요하므로 여기서 추적)
        // Note: 실제 경험치 적용은 장비 매니저가 이 데이터를 읽어가거나 이벤트를 통해 처리
    }

    /**
     * 특정 엔티티의 실시간 DPS 계산 (최근 5초 기준)
     */
    calculateDPS(entityId, windowMs = 5000) {
        const stats = this.stats.get(entityId);
        if (!stats) return 0;

        const now = Date.now();
        const cutoff = now - windowMs;

        // 윈도우 밖의 오래된 기록 정리
        stats.history = stats.history.filter(h => h.timestamp > cutoff);

        const totalInWindow = stats.history.reduce((sum, h) => sum + h.amount, 0);
        stats.dps = totalInWindow / (windowMs / 1000);
        
        return stats.dps;
    }

    /**
     * 특정 엔티티의 누적 통계 가져오기
     */
    getStats(entityId) {
        return this.stats.get(entityId) || { dealt: 0, received: 0, dps: 0 };
    }

    /**
     * 씬 종료 시 등 데이터 클리어
     */
    clear() {
        this.stats.clear();
        Logger.info("COMBAT_STATS", "Damage calculation statistics cleared.");
    }
}

const damageCalculationManager = new DamageCalculationManager();
export default damageCalculationManager;
