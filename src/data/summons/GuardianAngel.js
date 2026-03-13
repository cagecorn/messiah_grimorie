import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 수호천사 논리 데이터 (Guardian Angel Logic Data)
 * 세라의 궁극기로 소환되는 근접 전사 유닛입니다.
 */
export default {
    id: 'guardian_angel',
    name: 'Guardian Angel',
    className: ENTITY_CLASSES.WARRIOR,
    isSpecial: true,
    description: '세라의 기도에 응답하여 지상으로 강림한 수호천사입니다.',
    
    // 기본 스탯 (이 값들은 소환 시 세라의 mAtk에 의해 덮어씌워집니다)
    baseStats: {
        [STAT_KEYS.MAX_HP]: 500,
        [STAT_KEYS.HP]: 500,
        [STAT_KEYS.ATK]: 40,
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 30,
        [STAT_KEYS.M_DEF]: 30,
        [STAT_KEYS.SPEED]: 120,
        [STAT_KEYS.ATK_SPD]: 1.2,
        [STAT_KEYS.ATK_RANGE]: 80,
        [STAT_KEYS.RANGE_MIN]: 0,
        [STAT_KEYS.RANGE_MAX]: 80,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 100,
        [STAT_KEYS.EVA]: 15,
        [STAT_KEYS.CRIT]: 0.1,
        [STAT_KEYS.ULT_CHARGE]: 0, // 소환수는 궁극기가 없음
        [STAT_KEYS.RES_FIRE]: 20,
        [STAT_KEYS.RES_ICE]: 20,
        [STAT_KEYS.RES_LIGHTNING]: 20
    }
};
