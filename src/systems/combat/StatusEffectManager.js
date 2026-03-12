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
            silenced: false
        };
        this.timers = {};
    }

    applyEffect(type, duration) {
        if (this.states[type] !== undefined) {
            // 기존 타이머 클리어 (중첩 갱신)
            if (this.timers[type]) clearTimeout(this.timers[type]);

            this.states[type] = true;
            Logger.info("COMBAT", `${this.owner.name} is now ${type}!`);

            this.timers[type] = setTimeout(() => {
                this.states[type] = false;
                Logger.info("COMBAT", `${this.owner.name} recovered from ${type}.`);
            }, duration);
        }
    }

    isUnableToAct() {
        return this.states.stunned || this.states.frozen;
    }
}

export default StatusEffectManager;
