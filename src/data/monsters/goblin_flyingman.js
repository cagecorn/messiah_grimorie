import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 고블린 플라잉맨 (Goblin FlyingMan)
 * 역할: [공중 기동형 일반 몬스터]
 * 특징: 스킬은 없으나 비행 상태로 기동성이 높고 원거리 공격을 수행함.
 */
export default {
    id: 'goblin_flyingman',
    name: 'Goblin FlyingMan',
    className: ENTITY_CLASSES.FLYINGMAN,
    isSpecial: false,
    skill: null, // [REQ] 스킬 없음
    projectile: 'bullet',
    description: '조잡한 날개를 달고 공중에서 공격하는 고블린입니다.',
    level: 1,
    exp: 0,
    dropTableId: 'goblin_common',
    baseRewardExp: 10,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 45,    // 일반 고블린(50)보다 약간 낮음 (비행 패널티)
        [STAT_KEYS.ATK]: 6,        // 일반 고블린(5)보다 약간 높음
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 1,
        [STAT_KEYS.M_DEF]: 1,
        [STAT_KEYS.SPEED]: 120,    // 비행 유닛다운 빠른 이동속도
        [STAT_KEYS.ATK_SPD]: 0.9,  // 일반 고블린(0.8)보다 약간 빠름
        [STAT_KEYS.ATK_RANGE]: 250, // 원거리 공격 수행
        [STAT_KEYS.RANGE_MIN]: 100,
        [STAT_KEYS.RANGE_MAX]: 250,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 75,
        [STAT_KEYS.EVA]: 10,       // 공중 유닛이므로 회피가 조금 더 높음
        [STAT_KEYS.CRIT]: 0.02,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: -10, // 비행 날개가 불에 약함
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: -20, // 공중에 있어 번개에 취약
        [STAT_KEYS.STAMINA]: 100,
        [STAT_KEYS.STAM_REGEN]: 15
    }
};
