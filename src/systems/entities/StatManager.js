import Logger from '../../utils/Logger.js';
import { STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 스탯 매니저 (Stat Manager)
 * 역할: [엔티티의 수치 데이터 계산 및 관리]
 * 
 * 공식: Total = (Base + Equip + BonusAddition) * Multipliers
 */
class StatManager {
    constructor() {
        this.baseStats = {};      // 레벨업/성장에 따른 기본 수치
        this.equipStats = {};     // 장비 장착에 따른 보너스 합산
        this.bonusStats = {};     // 버프/스킬에 의한 일시적 합산 보너스
        this.multipliers = {};    // 곱연산 배율 (기본 1.0)
        
        this.finalStats = {};
        this.starMultiplier = 1.0; // 성급 배율 (별도 관리)
    }

    /**
     * 초기화
     * @param {Object} stats 초기 기본 스탯
     */
    init(stats) {
        // 모든 스탯 키에 대해 초기값 설정
        Object.values(STAT_KEYS).forEach(key => {
            this.baseStats[key] = stats[key] !== undefined ? stats[key] : (key === STAT_KEYS.ULT_CHARGE ? 1.0 : 0);
            this.equipStats[key] = 0;
            this.bonusStats[key] = 0;
            this.multipliers[key] = 1.0;
        });

        this.calculateFinalStats();
    }

    /**
     * 최종 스탯 계산
     * 공식: (기본 + 장비 + 버프합산) * (개별멀티플라이어 * 성급배율)
     */
    calculateFinalStats() {
        Object.values(STAT_KEYS).forEach(key => {
            const base = (this.baseStats[key] || 0) + (this.equipStats[key] || 0) + (this.bonusStats[key] || 0);
            
            // 성급 배율 적용 여부 판단 (이동속도, 사거리 등 제외)
            let m = this.multipliers[key] || 1.0;
            if (key !== STAT_KEYS.SPEED && key !== STAT_KEYS.ATK_SPD && !key.includes('Range')) {
                m *= this.starMultiplier;
            }

            this.finalStats[key] = base * m;
        });

        // HP 동기화 (기존 로직 유지)
        if (this.finalStats[STAT_KEYS.HP] <= 0 && this.finalStats[STAT_KEYS.MAX_HP] > 0) {
            this.finalStats[STAT_KEYS.HP] = this.finalStats[STAT_KEYS.MAX_HP];
        }
    }

    /**
     * 성급 배율 업데이트
     */
    setStarMultiplier(multiplier) {
        this.starMultiplier = multiplier;
        this.calculateFinalStats();
    }

    /**
     * 특정 카테고리의 스탯 업데이트
     * @param {string} category 'base', 'equip', 'bonus', 'mult'
     */
    update(category, key, value) {
        switch(category) {
            case 'base': this.baseStats[key] = value; break;
            case 'equip': this.equipStats[key] = value; break;
            case 'bonus': this.bonusStats[key] = value; break;
            case 'mult': this.multipliers[key] = value; break;
        }
        this.calculateFinalStats();
    }

    get(key) {
        return this.finalStats[key] || 0;
    }

    // --- 전투 유틸리티 ---
    
    takeDamage(amount) {
        const current = this.finalStats[STAT_KEYS.HP];
        this.finalStats[STAT_KEYS.HP] = Math.max(0, current - amount);
        return this.finalStats[STAT_KEYS.HP];
    }

    heal(amount) {
        const current = this.finalStats[STAT_KEYS.HP];
        const max = this.finalStats[STAT_KEYS.MAX_HP];
        this.finalStats[STAT_KEYS.HP] = Math.min(max, current + amount);
        return this.finalStats[STAT_KEYS.HP];
    }
}

export default StatManager;
