/**
 * 블러드 레이지: 공격 속도 증폭 (Blood Rage: AtkSpd Buff)
 */
export default class BloodRageAtkSpd {
    static apply(target, duration, value = 0.5) { // 50% 증가
        if (!target.buffs) return;

        target.buffs.addBuff({
            id: 'atk_speed_up_blood_rage',
            icon: 'atk_speed_up', // [신규] 명시적 아이콘 지정
            key: 'atkSpd',
            value: value,
            type: 'mult',
            duration: duration
        });
    }
}
