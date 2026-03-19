import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 소환수 데이터: 바바오 (Babao)
 * 역할: [바오의 동생 - 근접 전사형 소환수]
 */
export default {
    id: 'babao',
    name: 'Babao',
    className: ENTITY_CLASSES.WARRIOR,
    isSpecial: true,
    description: '바오의 동생이자 든든한 조력자입니다.',
    
    // 기본 스탯 (소환 시 바오의 mAtk에 의해 스케일링됨)
    baseStats: {
        [STAT_KEYS.MAX_HP]: 350,
        [STAT_KEYS.HP]: 350,
        [STAT_KEYS.ATK]: 35,
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 25,
        [STAT_KEYS.M_DEF]: 15,
        [STAT_KEYS.SPEED]: 140,
        [STAT_KEYS.ATK_SPD]: 1.3,
        [STAT_KEYS.ATK_RANGE]: 60,
        [STAT_KEYS.RANGE_MIN]: 0,
        [STAT_KEYS.RANGE_MAX]: 70,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 95,
        [STAT_KEYS.EVA]: 10,
        [STAT_KEYS.CRIT]: 0.15,
        [STAT_KEYS.ULT_CHARGE]: 0,
        [STAT_KEYS.RES_FIRE]: 10,
        [STAT_KEYS.RES_ICE]: 10,
        [STAT_KEYS.RES_LIGHTNING]: 10,
        [STAT_KEYS.STAMINA]: 100,
        [STAT_KEYS.STAM_REGEN]: 20
    }
};
