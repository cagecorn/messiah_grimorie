import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 클래스 데이터: 성기사 (Holy Knight)
 * 트레이트: [높은 마법 저항력과 아군 보호에 특화된 근접 클래스]
 */
export const HolyKnightData = {
    className: ENTITY_CLASSES.HOLYKNIGHT,
    description: 'Higher magic resistance and support capabilities. Grows significantly in M.ATK and M.DEF.',
    traits: [
        'Holy Aura: Periodically heals nearby allies.',
        'Magic Guard: High base magic resistance.'
    ],
    growth: {
        [STAT_KEYS.M_ATK]: 2.0,
        [STAT_KEYS.M_DEF]: 2.0,
        [STAT_KEYS.MAX_HP]: 2.5,
        [STAT_KEYS.ATK]: 1.2,
        [STAT_KEYS.DEF]: 1.2,
        [STAT_KEYS.STAMINA]: 2.0,
        [STAT_KEYS.STAM_REGEN]: 0.2
    }
};
