import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 자인 분신 데이터 (Zayn Clone Data)
 * Rogue 클래스, Stealth 스킬 보유, 궁극기 없음
 */
export default {
    id: 'zayn_clone',
    name: 'Zayn Clone',
    className: ENTITY_CLASSES.ROGUE,
    isSpecial: true,
    skill: 'zayn', // Stealth 스킬 (자인과 동일한 키 사용 가능)
    spriteKey: 'merc_zayn_sprite', // 본체 이미지 그대로 사용 (SpawnManager 규격)
    baseStats: {
        // 실제 스탯은 소환 시점에 Zayn의 2/3로 스케일링됨
        [STAT_KEYS.MAX_HP]: 60,
        [STAT_KEYS.ATK]: 15,
        [STAT_KEYS.DEF]: 4,
        [STAT_KEYS.SPEED]: 140,
        [STAT_KEYS.ATK_SPD]: 1.5,
        [STAT_KEYS.ATK_RANGE]: 45,
        [STAT_KEYS.ACC]: 95,
        [STAT_KEYS.EVA]: 30,
        [STAT_KEYS.CRIT]: 0.15
    }
};
