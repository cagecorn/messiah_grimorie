/**
 * 엔티티 상수 (Entity Constants)
 * 역할: 전역 엔티티 시스템에서 사용되는 스탯 키 및 클래스 정의
 */
export const STAT_KEYS = {
    HP: 'hp',
    MAX_HP: 'maxHp',
    ATK: 'atk',
    M_ATK: 'mAtk',
    DEF: 'def',
    M_DEF: 'mDef',
    SPEED: 'speed',
    ATK_SPD: 'atkSpd',
    ATK_RANGE: 'atkRange',
    RANGE_MIN: 'rangeMin',
    RANGE_MAX: 'rangeMax',
    CAST_SPD: 'castSpd',
    ACC: 'acc',
    EVA: 'eva',
    CRIT: 'crit',
    ULT_CHARGE: 'ultChargeSpeed',
    RES_FIRE: 'fireRes',
    RES_ICE: 'iceRes',
    RES_LIGHTNING: 'lightningRes'
};

export const ENTITY_CLASSES = {
    WARRIOR: 'warrior',
    ARCHER: 'archer',
    HEALER: 'healer',
    WIZARD: 'wizard',
    BARD: 'bard'
};

/**
 * 클래스별 성장 가중치 (Class Growth Weights)
 * 레벨업 시 해당 스탯이 얼마나 상승하는지에 대한 배율
 */
export const CLASS_GROWTH = {
    [ENTITY_CLASSES.WARRIOR]: {
        [STAT_KEYS.ATK]: 2.0,
        [STAT_KEYS.DEF]: 1.5,
        [STAT_KEYS.MAX_HP]: 3.0,
        [STAT_KEYS.M_ATK]: 0.5,
        [STAT_KEYS.M_DEF]: 0.8
    },
    [ENTITY_CLASSES.ARCHER]: {
        [STAT_KEYS.ATK]: 1.8,
        [STAT_KEYS.ATK_SPD]: 1.5,
        [STAT_KEYS.ACC]: 1.2,
        [STAT_KEYS.EVA]: 1.2,
        [STAT_KEYS.MAX_HP]: 1.5
    },
    [ENTITY_CLASSES.HEALER]: {
        [STAT_KEYS.M_ATK]: 2.0,
        [STAT_KEYS.M_DEF]: 1.5,
        [STAT_KEYS.MAX_HP]: 1.8,
        [STAT_KEYS.DEF]: 1.0
    },
    [ENTITY_CLASSES.WIZARD]: {
        [STAT_KEYS.M_ATK]: 2.5,
        [STAT_KEYS.M_DEF]: 1.2,
        [STAT_KEYS.ACC]: 1.5,
        [STAT_KEYS.MAX_HP]: 1.2
    },
    [ENTITY_CLASSES.BARD]: {
        [STAT_KEYS.MAX_HP]: 1.5,
        [STAT_KEYS.ATK]: 1.2,
        [STAT_KEYS.M_ATK]: 1.2,
        [STAT_KEYS.DEF]: 1.2,
        [STAT_KEYS.M_DEF]: 1.2,
        [STAT_KEYS.SPEED]: 1.1
    }
};

/**
 * 특이 케이스: 분(Boon)과 같은 성전사 컨셉 전사
 */
export const SPECIAL_GROWTH = {
    PALADIN_TYPE: {
        [STAT_KEYS.M_ATK]: 2.0,
        [STAT_KEYS.M_DEF]: 2.0,
        [STAT_KEYS.ATK]: 1.2,
        [STAT_KEYS.DEF]: 1.2,
        [STAT_KEYS.MAX_HP]: 2.5
    }
};
