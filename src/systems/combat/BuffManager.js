import Logger from '../../utils/Logger.js';

/**
 * 버프 매니저 (Buff Manager)
 * 역할: [일시적인 스탯 보너스 및 지속 효과 관리]
 * 
 * 설명: 기본 스탯을 오염시키지 않고 StatManager의 bonusStats/multipliers를 제어합니다.
 */
class BuffManager {
    constructor(owner) {
        this.owner = owner; // BaseEntity 인스턴스
        this.activeBuffs = [];
    }

    /**
     * 버프 추가
     * @param {Object} config { key, value, type: 'add'|'mult', duration, id }
     */
    addBuff(config) {
        const { key, value, type, duration, id } = config;
        
        const buff = {
            id: id || `${key}_${Date.now()}`,
            key,
            value,
            type,
            startTime: Date.now(),
            endTime: duration ? Date.now() + duration : Infinity
        };

        this.activeBuffs.push(buff);
        this.applyBuffEffect(buff);
        
        Logger.info("COMBAT", `Buff applied to ${this.owner.name}: ${buff.id}`);

        // 기간 한정 버프라면 타이머 설정
        if (duration && duration !== Infinity) {
            setTimeout(() => this.removeBuff(buff.id), duration);
        }
    }

    applyBuffEffect(buff) {
        const category = buff.type === 'mult' ? 'mult' : 'bonus';
        const current = this.owner.stats[category === 'mult' ? 'multipliers' : 'bonusStats'][buff.key] || (category === 'mult' ? 1.0 : 0);
        
        if (category === 'mult') {
            this.owner.stats.update(category, buff.key, current + buff.value); // 합연산 방식 (10% + 10% = 1.2배)
        } else {
            this.owner.stats.update(category, buff.key, current + buff.value);
        }
    }

    removeBuff(buffId) {
        const index = this.activeBuffs.findIndex(b => b.id === buffId);
        if (index !== -1) {
            const buff = this.activeBuffs[index];
            this.activeBuffs.splice(index, 1);
            
            // 효과 되돌리기
            const category = buff.type === 'mult' ? 'mult' : 'bonus';
            const current = this.owner.stats[category === 'mult' ? 'multipliers' : 'bonusStats'][buff.key];
            this.owner.stats.update(category, buff.key, current - buff.value);
            
            Logger.info("COMBAT", `Buff expired: ${buffId}`);
        }
    }

    /**
     * 현재 활성화된 버프의 ID 목록(중복 제거)을 반환합니다.
     */
    getActiveBuffIds() {
        const ids = this.activeBuffs.map(b => b.id.split('_')[0]); // 'inspiration_matk' -> 'inspiration'
        return [...new Set(ids)];
    }
}

export default BuffManager;
