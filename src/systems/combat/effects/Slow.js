import Logger from '../StatusEffectManager.js';

/**
 * 슬로우 효과 (Slow Effect)
 * 역할: [일정 시간 동안 이동 속도 50% 저하]
 */
class Slow {
    /**
     * 슬로우 효과 적용
     * @param {CombatEntity} target 대상
     * @param {number} duration 지속 시간 (ms)
     */
    static apply(target, duration) {
        if (!target || !target.logic || !target.logic.status) return;

        // [FIX] 무적 상태(I-frames)인 경우 CC기 면역
        if (target.isInvincible && target.isInvincible()) return;

        // 1. 상태 등록
        target.logic.status.applyEffect('slow', duration);

        // 2. 스탯 배율 적용 (이동속도 50% 감소)
        if (target.logic.stats) {
            target.logic.stats.update('mult', 'speed', 0.5);

            // 3. 종료 시 복구 로직 (StatusEffectManager가 타이머를 관리하므로, 별도 복구 트리거 필요)
            // 간단하게 여기서도 같은 시간의 타이머를 걸어 스탯 원복
            setTimeout(() => {
                if (target.logic && target.logic.isAlive && target.logic.stats) {
                    // 다른 슬로우가 아직 활성화 중인지 확인 (applyEffect가 중첩 갱신하므로 마지막 타이머가 유효)
                    if (!target.logic.status.states.slow) {
                        target.logic.stats.update('mult', 'speed', 1.0);
                    }
                }
            }, duration);
        }
    }
}

export default Slow;
