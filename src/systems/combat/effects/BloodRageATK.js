/**
 * 블러드 레이지: 공격력 증폭 (Blood Rage: ATK Buff)
 */
export default class BloodRageATK {
    static apply(target, duration, value = 1.0) { // 비약적 상승 (100% 증가)
        if (!target.buffs) return;

        target.buffs.addBuff({
            id: 'atk_up_blood_rage',
            icon: 'atk_up', // [신규] 명시적 아이콘 지정
            key: 'atk',
            value: value,
            type: 'mult',
            duration: duration
        });
    }
}
