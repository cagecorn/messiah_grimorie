import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 용병: 바이퍼 (Viper)
 * 클래스: 로그 (Rogue)
 * 특징: 어둠 속에서 활약하는 암살자. 높은 기동성과 치명타 성능.
 */
export default {
    id: 'viper',
    name: 'Viper',
    className: ENTITY_CLASSES.ROGUE,
    isSpecial: false,
    skill: 'sinking_shadow',
    ultimate: 'unknown',
    projectile: 'melee',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 110,      // 아렌(160)보다 낮고 세인(100)보다 높음
        [STAT_KEYS.ATK]: 24,         // 세인(18)보다 높은 공격력
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 5,          // 낮은 방어력
        [STAT_KEYS.M_DEF]: 5,
        [STAT_KEYS.SPEED]: 140,      // 매우 빠른 이동속도
        [STAT_KEYS.ATK_SPD]: 1.6,    // 매우 빠른 공격 속도
        [STAT_KEYS.ATK_RANGE]: 45,   // 근접 공격
        [STAT_KEYS.RANGE_MIN]: 15,
        [STAT_KEYS.RANGE_MAX]: 50,
        [STAT_KEYS.CAST_SPD]: 1.2,
        [STAT_KEYS.ACC]: 110,
        [STAT_KEYS.EVA]: 25,         // 높은 회피율
        [STAT_KEYS.CRIT]: 0.2,       // 높은 치명타 확률
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 0,     
        [STAT_KEYS.RES_ICE]: 10,
        [STAT_KEYS.RES_LIGHTNING]: 0,
        [STAT_KEYS.STAMINA]: 120,
        [STAT_KEYS.STAM_REGEN]: 30
    }
};
