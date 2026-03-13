import Logger from '../StatusEffectManager.js';

/**
 * 무적 효과 (Invincible Effect)
 * 역할: [일정 시간 동안 모든 데미지 무시 및 이동 불가]
 */
class Invincible {
    /**
     * 무적 효과 적용
     * @param {CombatEntity} target 대상
     * @param {number} duration 지속 시간 (ms)
     */
    static apply(target, duration) {
        if (!target || !target.status) return;

        target.status.applyEffect('invincible', duration);
    }
}

export default Invincible;
