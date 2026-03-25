import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 🎵 나나 (Nana) 데이터
 * 클래스: 바드 (Bard) -> 로그 (Rogue, 변신 후)
 */
export default {
    id: 'nana',
    name: 'Nana',
    className: ENTITY_CLASSES.BARD,
    isSpecial: false,
    skill: 'MusicalMagicalCritical', // 나나 전용 스킬
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 135,
        [STAT_KEYS.ATK]: 5,
        [STAT_KEYS.M_ATK]: 28,
        [STAT_KEYS.DEF]: 10,
        [STAT_KEYS.M_DEF]: 14,
        [STAT_KEYS.SPEED]: 115,
        [STAT_KEYS.ATK_SPD]: 1.1,
        [STAT_KEYS.ATK_RANGE]: 350,
        [STAT_KEYS.RANGE_MIN]: 0,
        [STAT_KEYS.RANGE_MAX]: 350,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 95,
        [STAT_KEYS.EVA]: 15,
        [STAT_KEYS.CRIT]: 0.15, // 크리티컬 확률 높음
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 0,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 0,
        [STAT_KEYS.STAMINA]: 100,
        [STAT_KEYS.STAM_REGEN]: 12
    }
};
