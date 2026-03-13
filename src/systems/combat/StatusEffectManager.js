import Logger from '../../utils/Logger.js';

/**
 * 상태이상 매니저 (Status Effect Manager)
 * 역할: [CC기(기절, 빙결) 및 도트 대미지 관리]
 */
class StatusEffectManager {
    constructor(owner) {
        this.owner = owner;
        this.states = {
            stunned: false,
            frozen: false,
            burned: false,
            silenced: false,
            airborne: false,
            knockback: false,
            invincible: false
        };
        this.timers = {};
    }

    applyEffect(type, duration) {
        if (this.states[type] !== undefined) {
            // 기존 타이머 클리어 (중첩 갱신)
            if (this.timers[type]) clearTimeout(this.timers[type]);

            this.states[type] = true;
            const targetName = this.owner.logic ? this.owner.logic.name : this.owner.name;
            Logger.info("COMBAT", `${targetName} is now ${type}!`);

            this.timers[type] = setTimeout(() => {
                this.states[type] = false;
                Logger.info("COMBAT", `${targetName} recovered from ${type}.`);
            }, duration);
        }
    }

    /**
     * 모든 상태이상 초기화 (풀링용)
     */
    clearAll() {
        for (const type in this.states) {
            this.states[type] = false;
            if (this.timers[type]) {
                clearTimeout(this.timers[type]);
                this.timers[type] = null;
            }
        }
    }

    isUnableToAct() {
        return this.states.stunned || this.states.frozen || this.states.airborne || this.states.knockback || this.states.invincible;
    }

    /**
     * 현재 활성화된 상태 이상의 ID 목록을 반환합니다.
     */
    getActiveEffectIds() {
        return Object.keys(this.states).filter(key => this.states[key] === true);
    }
}

export default StatusEffectManager;
