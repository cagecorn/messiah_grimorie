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
        this.timers = new Map(); // ID별 타이머 관리 [NEW]
    }

    /**
     * 버프 추가 (동일 ID 존재 시 리프레시)
     * @param {Object} config { key, value, type: 'add'|'mult', duration, id }
     */
    addBuff(config) {
        const { key, value, type, duration, id } = config;
        
        // [신규] 리프레시 로직: 동일 ID가 있으면 기존 버프 제거 (타이머 포함)
        if (id) {
            this.removeBuff(id, true); // silent=true (로그 중복 방지)
        }

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
            const timer = setTimeout(() => this.removeBuff(buff.id), duration);
            this.timers.set(buff.id, timer);
        }
    }

    applyBuffEffect(buff) {
        const category = buff.type === 'mult' ? 'mult' : 'bonus';
        const stats = this.owner.stats;
        const current = stats[category === 'mult' ? 'multipliers' : 'bonusStats'][buff.key] || (category === 'mult' ? 1.0 : 0);
        
        stats.update(category, buff.key, current + buff.value);
    }

    /**
     * 버프 제거
     * @param {string} buffId 
     * @param {boolean} silent 로그 출력 여부
     */
    removeBuff(buffId, silent = false) {
        const index = this.activeBuffs.findIndex(b => b.id === buffId);
        if (index !== -1) {
            const buff = this.activeBuffs[index];
            this.activeBuffs.splice(index, 1);
            
            // 타이머 제거
            if (this.timers.has(buffId)) {
                clearTimeout(this.timers.get(buffId));
                this.timers.delete(buffId);
            }

            // 효과 되돌리기
            const category = buff.type === 'mult' ? 'mult' : 'bonus';
            const stats = this.owner.stats;
            const current = stats[category === 'mult' ? 'multipliers' : 'bonusStats'][buff.key];
            stats.update(category, buff.key, current - buff.value);
            
            if (!silent) {
                Logger.info("COMBAT", `Buff expired: ${buffId}`);
            }
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
