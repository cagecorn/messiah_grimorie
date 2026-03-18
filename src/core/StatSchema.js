/**
 * 📊 스탯 스키마 (Stat Schema)
 * 역할: 시스템 전체에서 사용하는 핵심 스탯 키 및 클래스 명칭 정의
 * 
 * [주의] 이 파일은 다른 어떤 상수 파일도 참조해서는 안 됩니다. (순환 참조 방지용 최하단 리프)
 */

export const STAT_KEYS = {
    HP: 'hp',
    MAX_HP: 'maxHp',
    ATK: 'atk',
    M_ATK: 'mAtk',
    MATK: 'mAtk', // Alias for TechnicalConstants
    DEF: 'def',
    M_DEF: 'mDef',
    MDEF: 'mDef', // Alias for TechnicalConstants
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
    RES_LIGHTNING: 'lightningRes',
    SHIELD: 'shield',
    DR: 'bonusDR',
    STAMINA: 'stamina',
    STAM_REGEN: 'stamRegen',
    ID: 'id'
};

export const ENTITY_CLASSES = {
    WARRIOR: 'warrior',
    ARCHER: 'archer',
    HEALER: 'healer',
    WIZARD: 'wizard',
    BARD: 'bard',
    ROGUE: 'rogue',
    SWORDMASTER: 'swordmaster',
    TOTEMIST: 'totemist',
    FLYINGMAN: 'flyingman',
    SHADOWMANCER: 'shadowmancer'
};
