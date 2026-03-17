import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 용병: 세인 (Sein)
 * 클래스: 플라잉맨 (FlyingMan)
 * 특징: 높은 방어력을 가진 비행 유닛, 원거리 전투 수행
 */
export default {
    id: 'sein',
    name: 'Sein',
    className: ENTITY_CLASSES.FLYINGMAN,
    isSpecial: false,
    skill: 'tornado_shot',
    ultimate: 'unknown',
    projectile: 'bullet',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 100,      // 엘라(85)보다 높은 체력
        [STAT_KEYS.ATK]: 18,         // 엘라(22)보다 낮은 공격력
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 12,         // 엘라(6)보다 높은 방어력
        [STAT_KEYS.M_DEF]: 10,
        [STAT_KEYS.SPEED]: 130,
        [STAT_KEYS.ATK_SPD]: 1.4,
        [STAT_KEYS.ATK_RANGE]: 340,  // 엘라(380)보다 짧은 사거리
        [STAT_KEYS.RANGE_MIN]: 150,
        [STAT_KEYS.RANGE_MAX]: 350,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 100,
        [STAT_KEYS.EVA]: 15,
        [STAT_KEYS.CRIT]: 0.1,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 10,     
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: -10,
        [STAT_KEYS.STAMINA]: 100,
        [STAT_KEYS.STAM_REGEN]: 25
    }
};
