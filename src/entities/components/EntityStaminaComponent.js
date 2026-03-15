import Logger from '../../utils/Logger.js';
import { STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 엔티티 스태미나 컴포넌트 (Entity Stamina Component)
 * 역할: [스태미나 관리 및 자동 회복 로직]
 * 
 * 특징:
 * 1. 자동 회복: 매 프레임 stamRegen 수치에 따라 회복
 * 2. 상태 관리: 스태미나가 0일 때 '탈진(Exhausted)' 상태 진입 (계획 중)
 */
export default class EntityStaminaComponent {
    constructor(entity) {
        this.entity = entity;
        this.logic = entity.logic;
        
        // 1. 초기화 (logic.stats에서 가져옴)
        this.maxStamina = this.logic.stats.get(STAT_KEYS.STAMINA) || 100;
        this.currentStamina = this.maxStamina;
        this.isExhausted = false;
    }

    /**
     * 컴포넌트 재사용을 위한 리셋 (풀링 연동)
     */
    reset() {
        this.logic = this.entity.logic;
        this.maxStamina = this.logic.stats.get(STAT_KEYS.STAMINA) || 100;
        this.currentStamina = this.maxStamina;
        this.isExhausted = false;
    }

    /**
     * 프레임 업데이트
     */
    update(delta) {
        if (!this.logic.isAlive) return;

        // 1. 스태미나 자동 회복
        if (this.currentStamina < this.maxStamina) {
            const regen = this.logic.stats.get(STAT_KEYS.STAM_REGEN) || 10; // 기본 초당 10
            const amount = (regen * delta) / 1000;
            
            this.currentStamina = Math.min(this.maxStamina, this.currentStamina + amount);
            
            // HUD 갱신 (더티 플래그 세팅)
            if (this.entity.hpBar) {
                this.entity.hpBar.isDirty = true;
            }
        }

        // 2. 탈진 상태 체크 (나중에 구르기 등 시스템 추가 시 확장)
        if (this.currentStamina <= 0) {
            this.isExhausted = true;
        } else if (this.currentStamina >= 20) { // 20% 이상 차면 탈진 해제 예시
            this.isExhausted = false;
        }
    }

    /**
     * 스태미나 소모 시도
     * @param {number} amount 소모량
     * @returns {boolean} 성공 여부
     */
    consume(amount) {
        if (this.currentStamina >= amount) {
            this.currentStamina -= amount;
            if (this.entity.hpBar) this.entity.hpBar.isDirty = true;
            return true;
        }
        return false;
    }

    /**
     * 현재 스태미나 비율 (0.0 ~ 1.0)
     */
    getProgress() {
        return Math.max(0, this.currentStamina / this.maxStamina);
    }
}
