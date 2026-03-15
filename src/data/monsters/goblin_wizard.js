import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 고블린 위자드 (Goblin Wizard)
 * 역할: [원거리 마법 딜러, 파이어 버스트 사용]
 */
export default {
    id: 'goblin_wizard',
    name: 'Goblin Wizard',
    className: ENTITY_CLASSES.WIZARD,
    isSpecial: false,
    description: '서툰 마법으로 불꽃을 터뜨리는 고블린 마법사.',
    level: 1,
    exp: 0,
    dropTableId: 'goblin_common', // 기본 고블린 드랍 테이블 공유
    baseRewardExp: 25,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 30,      // 위자드답게 허약함
        [STAT_KEYS.ATK]: 1,
        [STAT_KEYS.M_ATK]: 12,      // 강력한 한방
        [STAT_KEYS.DEF]: 1,
        [STAT_KEYS.M_DEF]: 8,
        [STAT_KEYS.SPEED]: 90,
        [STAT_KEYS.ATK_SPD]: 0.85,
        [STAT_KEYS.ATK_RANGE]: 300,
        [STAT_KEYS.RANGE_MIN]: 100,
        [STAT_KEYS.RANGE_MAX]: 350,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 85,
        [STAT_KEYS.EVA]: 5,
        [STAT_KEYS.CRIT]: 0.1,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 20,    // 화염 저항 높음
        [STAT_KEYS.RES_ICE]: -10,   // 냉기 취약
        [STAT_KEYS.RES_LIGHTNING]: 0,
        [STAT_KEYS.STAMINA]: 50,
        [STAT_KEYS.STAM_REGEN]: 20
    }
};
