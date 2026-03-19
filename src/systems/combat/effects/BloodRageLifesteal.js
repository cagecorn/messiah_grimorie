/**
 * 블러드 레이지: 피해 흡혈 (Blood Rage: Lifesteal Buff)
 * 역할: [가한 물리 데미지의 일정 비율만큼 체력 회복]
 */
export default class BloodRageLifesteal {
    static apply(target, duration, value = 0.5) { // 50% 흡혈
        if (!target.buffs) return;

        target.buffs.addBuff({
            id: 'lifesteal_blood_rage',
            key: 'lifesteal',
            value: value,
            type: 'add',
            duration: duration
        });
    }
}
