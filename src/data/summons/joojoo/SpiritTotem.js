import { ENTITY_CLASSES, STAT_KEYS } from '../../../core/EntityConstants.js';

/**
 * 정령 토템 (Spirit Totem) - 주주의 기본 공격형 토템
 * 역할: [사거리 내의 적에게 마법 투사체 발사]
 */
export default {
    id: 'spirit_totem',
    name: 'Spirit Totem',
    className: ENTITY_CLASSES.WIZARD,
    spriteKey: 'spirit_totem_sprite',
    baseStats: {
        [STAT_KEYS.MAX_HP]: 50,
        [STAT_KEYS.HP]: 50,
        [STAT_KEYS.ATK]: 0,
        [STAT_KEYS.M_ATK]: 20, // 마스터로부터 100% 상속받을 예정
        [STAT_KEYS.DEF]: 10,
        [STAT_KEYS.M_DEF]: 10,
        [STAT_KEYS.SPEED]: 0,
        [STAT_KEYS.ATK_SPD]: 0.5,
        [STAT_KEYS.ATK_RANGE]: 300,
        [STAT_KEYS.RANGE_MIN]: 0,
        [STAT_KEYS.RANGE_MAX]: 300,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 100,
        [STAT_KEYS.EVA]: 0,
        [STAT_KEYS.CRIT]: 0.05,
        [STAT_KEYS.ULT_CHARGE]: 0,
        [STAT_KEYS.RES_FIRE]: 0,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 0,
        [STAT_KEYS.STAMINA]: 0,
        [STAT_KEYS.STAM_REGEN]: 0
    }
};
