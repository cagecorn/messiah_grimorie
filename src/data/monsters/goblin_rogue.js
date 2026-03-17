import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'goblin_rogue',
    name: 'Goblin Rogue',
    className: ENTITY_CLASSES.ROGUE,
    isSpecial: false,
    skill: 'BasicSwing', // 로그의 빠른 평타
    description: '날렵하게 움직이며 치명타를 노리는 고블린 도적입니다.',
    level: 1,
    exp: 0,
    dropTableId: 'goblin_common',
    baseRewardExp: 10,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 40,    // 일반(50)보다 낮음
        [STAT_KEYS.ATK]: 5,        // 일반과 동일하지만 치명타가 높음
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 1,        // 일반(2)보다 약함
        [STAT_KEYS.M_DEF]: 1,
        [STAT_KEYS.SPEED]: 110,    // 일반(90)보다 매우 빠름
        [STAT_KEYS.ATK_SPD]: 1.2,  // 일반(0.8)보다 공격 속도가 빠름
        [STAT_KEYS.ATK_RANGE]: 40,
        [STAT_KEYS.RANGE_MIN]: 15,
        [STAT_KEYS.RANGE_MAX]: 40,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 85,       // 명중률 높음
        [STAT_KEYS.EVA]: 15,       // 일반(5)보다 회피율 높음
        [STAT_KEYS.CRIT]: 0.15,    // 일반(0.01)보다 치명타율 매우 높음
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: -10,
        [STAT_KEYS.RES_ICE]: -10,
        [STAT_KEYS.RES_LIGHTNING]: 0,
        [STAT_KEYS.STAMINA]: 100,
        [STAT_KEYS.STAM_REGEN]: 15
    }
};
