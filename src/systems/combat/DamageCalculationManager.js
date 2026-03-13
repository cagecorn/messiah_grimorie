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
        const id = entityId.toLowerCase();
        if (!this.stats.has(id)) {
            this.stats.set(id, {
                dealt: 0,
                received: 0,
                healed: 0, // [신규] 누적 힐량
                dps: 0,
                history: [], // { timestamp: number, amount: number }
                // [신규] 속성별 세부 통계
                dealtByElement: { physical: 0, magic: 0, fire: 0, ice: 0, lightning: 0 },
                receivedByElement: { physical: 0, magic: 0, fire: 0, ice: 0, lightning: 0 }
            });
        }
        return id;
    }

    /**
     * 데미지 기록 (공격자와 피격자 모두 기록)
     * @param {object} attacker 공격자 로직
     * @param {object} target 피격자 로직
     * @param {number} amount 데미지 양
     * @param {string} type 속성
     * @param {string} projectileId 투사체 고유 ID (선택 사항)
     */
    recordDamage(attacker, target, amount, type = 'physical', projectileId = null) {
        if (!attacker || !target) return;

        // [USER 요청] 투사체가 있으면 투사체 ID를 추적, 없으면 공격자 ID 사용
        const trackerId = projectileId ? projectileId : attacker.id;
        const attackerId = this.initEntity(trackerId);
        const targetId = this.initEntity(target.id);

        const trackerStats = this.stats.get(attackerId);
        const targetStats = this.stats.get(targetId);

        // 1. 누적 데이터 기록
        trackerStats.dealt += amount;
        targetStats.received += amount;

        // [신규] 투사체 추적 시, 원본 시전자(Owner) 정보도 내부적으로 매핑해두면 좋으나 
        // 일단은 ID 기반으로 분리 기록함.
        // 나중에 Weapon Leveling에서 "proj_arrow_ella_1" -> "ella"로 매핑하여 경험치 합산 필요.

        // 3. DPS 계산을 위한 공격자 히스토리 기록
        trackerStats.history.push({
            timestamp: Date.now(),
            amount: amount,
            type: type 
        });

        // [신규] 무기 경험치 동기화 시스템 (준 데미지에 비례)
        // Note: EquipmentManager 혹은 별도 WeaponExpManager가 이 데이터를 구독
    }

    /**
     * 힐량 기록 (치료자와 대상자 모두 기록)
     */
    recordHeal(healer, target, amount) {
        if (!healer || !target) return;

        const healerId = this.initEntity(healer.id);
        const targetId = this.initEntity(target.id);

        const healerStats = this.stats.get(healerId);
        
        // 힐러의 누적 힐량 증가
        healerStats.healed += amount;

        // 힐도 DPS(HPS) 추적에 포함 (옵션)
        healerStats.history.push({
            timestamp: Date.now(),
            amount: amount,
            type: 'heal'
        });
    }

    /**
     * 특정 엔티티의 실시간 DPS 계산 (최근 5초 기준)
     */
    calculateDPS(entityId, windowMs = 5000) {
        const id = entityId.toLowerCase();
        const stats = this.stats.get(id);
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
        const id = entityId.toLowerCase();
        return this.stats.get(id) || { dealt: 0, received: 0, healed: 0, dps: 0 };
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
