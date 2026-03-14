import Logger from '../../utils/Logger.js';
import { STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 쉴드 매니저 (Shield Manager)
 * 역할: [일시적인 데미지 흡수 보호막 관리]
 * 
 * 설명: 
 * - 체력보다 먼저 감소하는 보호막 수치를 관리합니다.
 * - 여러 개의 보호막이 중첩될 수 있으며, 각각 만료 시간이 다를 수 있습니다.
 */
class ShieldManager {
    constructor(owner) {
        this.owner = owner; // BaseEntity 인스턴스
        this.activeShields = [];
    }

    /**
     * 보호막 추가
     * @param {Object} config { amount, duration, id }
     */
    addShield(config) {
        const { amount, duration, id } = config;
        
        const shield = {
            id: id || `shield_${Date.now()}`,
            amount: amount,
            expireTime: duration ? Date.now() + duration : Infinity
        };

        this.activeShields.push(shield);
        this.updateOwnerStats();
        
        Logger.info("COMBAT", `Shield applied to ${this.owner.name}: +${amount.toFixed(1)}`);

        if (duration && duration !== Infinity) {
            setTimeout(() => this.removeShield(shield.id), duration);
        }
    }

    /**
     * 특정 보호막 제거
     */
    removeShield(shieldId) {
        const index = this.activeShields.findIndex(s => s.id === shieldId);
        if (index !== -1) {
            this.activeShields.splice(index, 1);
            this.updateOwnerStats();
            Logger.info("COMBAT", `Shield expired or removed: ${shieldId}`);
        }
    }

    /**
     * 데미지 흡수 처리
     * @param {number} damage 발생한 데미지
     * @returns {number} absorberdAmount 흡수된 데미지 양
     */
    absorbDamage(damage) {
        let remainingDamage = damage;
        let totalAbsorbed = 0;

        // 활성화된 보호막부터 순차적으로 차감
        for (let i = 0; i < this.activeShields.length; i++) {
            const shield = this.activeShields[i];
            const absorb = Math.min(shield.amount, remainingDamage);
            
            shield.amount -= absorb;
            remainingDamage -= absorb;
            totalAbsorbed += absorb;

            if (remainingDamage <= 0) break;
        }

        // 수치가 0이 된 보호막 즉시 정리
        this.activeShields = this.activeShields.filter(s => s.amount > 0);
        
        if (totalAbsorbed > 0) {
            this.updateOwnerStats();
            Logger.info("COMBAT", `${this.owner.name}'s shield absorbed ${totalAbsorbed.toFixed(1)} damage.`);
        }

        return totalAbsorbed;
    }

    /**
     * 현재 전체 보호막 합계 계산
     */
    getTotalShield() {
        return this.activeShields.reduce((sum, s) => sum + s.amount, 0);
    }

    /**
     * StatManager에 현재 보호막 총합 동기화
     */
    updateOwnerStats() {
        if (!this.owner || !this.owner.stats) return;
        
        const total = this.getTotalShield();
        // STAT_KEYS.SHIELD에 현재 보호막 총합 할당
        // bonusStats 카테고리를 활용하여 일시적인 합산치로 관리
        this.owner.stats.update('bonus', STAT_KEYS.SHIELD, total);
        
        // 쉴드 변화 시 HP바 Dirty 설정 (UI 최신화를 위해)
        // Note: BaseEntity는 씬 객체를 모르므로, CombatEntity에서 처리하거나 이벤트를 발생시켜야 함.
    }
}

export default ShieldManager;
