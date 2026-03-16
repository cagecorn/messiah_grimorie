/**
 * 메시아 그리모어 기술 용어 표준 (Technical Terminology Standard)
 * 모든 엔티티와 전투 시스템에서 이 상수를 참조하여 데이터 일관성을 유지합니다.
 */

//#region ⚔️ [구역 1] 엔티티 스탯 명칭 (Technical Terminology)
// 코드 내부에서 사용하는 엔티티 스탯 명칭 통일 (환각 및 버그 방지)
export const STATS = {
    HP: 'hp',                      // 현재 체력
    MAX_HP: 'maxHp',               // 최대 체력
    ATK: 'atk',                    // 공격력 (attackDamage 사용 금지)
    MATK: 'mAtk',                  // 마법 공격력
    DEF: 'def',                    // 방어력
    MDEF: 'mDef',                  // 마법 방어력
    SPEED: 'speed',                // 이동 속도
    ATK_SPD: 'atkSpd',             // 공격 속도 (또는 attackDelay)
    ATK_RANGE: 'atkRange',         // 공격 사거리
    RANGE_MIN: 'rangeMin',         // 최소 유지 거리 (원거리용)
    RANGE_MAX: 'rangeMax',         // 최대 유지 거리 (원거리용)
    CAST_SPD: 'castSpd',           // 시전 속도
    ACC: 'acc',                    // 정확도 (물리 공격 시)
    EVA: 'eva',                    // 회피도 (물리 공격 시)
    CRIT: 'crit',                  // 치명타율
    ULT_CHARGE: 'ultChargeSpeed',  // 궁극기 충전 속도 배율 (기본 1.0)
    FIRE_RES: 'fireRes',           // 불 저항력 (%)
    ICE_RES: 'iceRes',             // 얼음 저항력 (%)
    LIGHTNING_RES: 'lightningRes', // 번개 저항력 (%)
    STAMINA: 'stamina',           // 스태미나 (행동력)
    STAM_REGEN: 'stamRegen',       // 스태미나 초당 회복량
    ID: 'id'                       // 엔티티 고유 식별자
};
//#endregion

//#region 📈 [구역 2] 레벨업 스탯 성장 규칙 (Level-up Stat Scaling)
// 모든 용병은 레벨업 시 클래스의 특색에 가중치를 두어 스탯이 자동으로 성장합니다.

export const CLASSES = {
    WARRIOR: 'warrior',
    ARCHER: 'archer',
    HEALER: 'healer',
    WIZARD: 'wizard',
    BARD: 'bard',
    ROGUE: 'rogue',
    TOTEMIST: 'totemist'
};

// 기공(Base Increase): 모든 클래스 공통 기본 성장치
export const BASE_GROWTH_STATS = [
    STATS.HP, STATS.MAX_HP, STATS.ATK, STATS.MATK, 
    STATS.DEF, STATS.MDEF, STATS.SPEED
];

// 특화(Specialization): 클래스별 주요 능력치 가중치 적용 대상
export const CLASS_SCALING_TRAITS = {
    [CLASSES.WARRIOR]: [STATS.ATK, STATS.DEF, STATS.MAX_HP],
    [CLASSES.ARCHER]: [STATS.ATK, STATS.ATK_SPD, STATS.ACC, STATS.EVA],
    [CLASSES.HEALER]: [STATS.MATK, STATS.MDEF],
    [CLASSES.WIZARD]: [STATS.MATK, STATS.MDEF, STATS.ACC],
    [CLASSES.BARD]: [STATS.HP, STATS.ATK, STATS.MATK, STATS.DEF, STATS.MDEF],
    [CLASSES.ROGUE]: [STATS.ATK, STATS.ATK_SPD, STATS.SPEED, STATS.CRIT]
};

// 예외 처리: 특정 요건(예: 성기사 컨셉의 분)에 따른 고유 성장 테이블
export const UNIQUE_SCALING_CASES = {
    'boon': {
        traits: [STATS.MATK, STATS.MDEF], // warrior임에도 mAtk, mDef가 더 많이 상승
        baseClass: CLASSES.WARRIOR
    }
};
//#endregion

//#region 🛡️ [구역 3] 스탯 참조 및 수정 (Getters & Modification)
// 기본 스탯을 직접 수정하지 않고 보너스 변수들을 활용합니다. (영구 스탯 오염 방지)

export const BONUS_STATS = {
    ATK: 'bonusAtk',
    MATK: 'bonusMAtk',
    CRIT: 'bonusCrit',
    EVA: 'bonusEva',
    SPEED: 'bonusSpeed',
    DEF: 'bonusDef',
    MDEF: 'bonusMDef',
    ATK_SPD: 'bonusAtkSpd',
    ACC: 'bonusAcc',
    DR: 'bonusDR',             // Damage Reduction
    CAST_SPD: 'bonusCastSpd',
    ULT_CHARGE: 'bonusUltChargeSpeed',
    MAX_HP: 'bonusMaxHp',
    MAX_HP_MULT: 'bonusMaxHpMult',
    STAMINA: 'bonusStamina',
    STAM_REGEN: 'bonusStamRegen',
    ATK_RANGE: 'bonusAtkRange',
    RANGE_MIN: 'bonusRangeMin',
    RANGE_MAX: 'bonusRangeMax'
};

// 통합 Getter 표준 명칭
export const GETTERS = {
    ATK: 'getTotalAtk',
    MATK: 'getTotalMAtk',
    CRIT: 'getTotalCrit',
    DEF: 'getTotalDef',
    EVA: 'getTotalEva',
    SPEED: 'getTotalSpeed',
    ATK_SPD: 'getTotalAtkSpd',
    ACC: 'getTotalAcc'
};
//#endregion

//#region 💥 [구역 4] 데미지 및 힐 공식 (Equations & Stacking)
export const COMBAT = {
    // 물리 데미지: attacker.getTotalAtk() * Multiplier
    // 마법 데미지/힐: attacker.getTotalMAtk() * Multiplier
    calcPhysicalDamage: (atk, multiplier) => atk * multiplier,
    calcMagicEffect: (mAtk, multiplier) => mAtk * multiplier,
    
    // 중첩 규칙: (Base + Equipment) * Multipliers
    // 퍼센트 보너스 계산 시 기준점 유지로 지수적 폭주 방지
    calcBaseWithEquip: (base, equip) => base + equip,
    applyMultipliers: (value, multipliers) => value * multipliers
};
//#endregion

//#region 👯 [구역 5] 소환 및 복제물 (Summons & Clones)
// 소환물의 초기 스탯은 마스터의 getTotal...() 값을 기반으로 스케일링
export const SUMMON_SCALING = {
    getMasterStat: (master, statKey) => {
        const getterName = GETTERS[statKey.toUpperCase()];
        return master[getterName] ? master[getterName]() : master[statKey];
    }
};
//#endregion

//#region 🔋 [구역 6] 스태미나 시스템 (Stamina System)
// 스태미나 소모량 및 기본 수치를 관리합니다.
export const STAMINA = {
    DEFAULT_MAX: 100,        // 기본 최대 스태미나
    DEFAULT_REGEN: 10,      // 기본 초당 재생량
    JUMP_COST: 30,          // 점프(급습) 소모량
    ROLL_COST: 30,          // 구르기(회피) 소모량
    PARRY_COST: 15          // 패링(반사) 소모량
};
//#endregion

//#region 🌀 [구역 7] 디버프/버프 세부 수치 (Status & Buff Details)
export const BUFF_VALUES = {
    GALE: {
        DURATION: 8000,
        RANGE_BONUS: 220,
        MIN_RANGE_BONUS: 100
    },
    RAPID_FIRE: {
        DURATION: 12000,
        SHOT_COUNT: 5,
        INTERVAL: 80
    }
};
//#endregion

console.log("✅ [TechnicalConstants] 기술 용어 및 전투 표준 시스템 로드 완료.");
