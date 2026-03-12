/**
 * 메시아 그리모어 기술 용어 표준 (Technical Terminology Standard)
 * 모든 엔티티와 전투 시스템에서 이 상수를 참조하여 데이터 일관성을 유지합니다.
 */

// ==========================================
// ⚔️ [구역 1] 엔티티 스탯 명칭 (Standardized Stats)
// ==========================================
export const STATS = {
    HP: 'hp',
    MAX_HP: 'maxHp',
    ATK: 'atk',                // 물리 공격력
    MATK: 'mAtk',              // 마법 공격력
    DEF: 'def',                // 물리 방어력
    MDEF: 'mDef',              // 마법 방어력
    SPEED: 'speed',            // 이동 속도
    ATK_SPD: 'atkSpd',         // 공격 속도
    ATK_RANGE: 'atkRange',     // 공격 사거리
    RANGE_MIN: 'rangeMin',     // 최소 유지 거리
    RANGE_MAX: 'rangeMax',     // 최대 유지 거리
    CAST_SPD: 'castSpd',       // 시전 속도
    ACC: 'acc',                // 정확도
    EVA: 'eva',                // 회피도
    CRIT: 'crit',              // 치명타율
    ULT_CHARGE: 'ultChargeSpeed', // 궁극기 충전 속도 배율
    FIRE_RES: 'fireRes',       // 불 저항력
    ICE_RES: 'iceRes',         // 얼음 저항력
    LIGHTNING_RES: 'lightningRes', // 번개 저항력
    ID: 'id'                   // 고유 식별자
};

// ==========================================
// 🛡️ [구역 2] 보너스 속성 (Stat Modification)
// ==========================================
// 기본 스탯을 직접 수정하지 않고 아래 보너스 변수들을 합산합니다.
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
    MAX_HP_MULT: 'bonusMaxHpMult'
};

// ==========================================
// 🎖️ [구역 3] 직업 및 성장 특색 (Classes & Scaling)
// ==========================================
export const CLASSES = {
    WARRIOR: 'warrior',
    ARCHER: 'archer',
    HEALER: 'healer',
    WIZARD: 'wizard',
    BARD: 'bard'
};

export const CLASS_TRAITS = {
    [CLASSES.WARRIOR]: ['atk', 'def', 'maxHp'],
    [CLASSES.ARCHER]: ['atk', 'atkSpd', 'acc', 'eva'],
    [CLASSES.HEALER]: ['mAtk', 'mDef'],
    [CLASSES.WIZARD]: ['mAtk', 'mDef', 'acc'],
    [CLASSES.BARD]: ['hp', 'atk', 'mAtk', 'def', 'mDef'] // 균등 성장
};

// ==========================================
// 💥 [구역 4] 전투 공식 (Combat Formulas)
// ==========================================
export const COMBAT = {
    // 물리 데미지 계산식
    calcPhysicalDamage: (attackerTotalAtk, multiplier) => {
        return attackerTotalAtk * multiplier;
    },
    // 마법 데미지/힐 계산식
    calcMagicEffect: (attackerTotalMAtk, multiplier) => {
        return attackerTotalMAtk * multiplier;
    },
    // 중첩 규칙: (Base + Equipment) * Multipliers
    // 지수적 폭주를 막기 위해 합산 후 최종 곱연산 적용 원칙
};

/**
 * 표준 Getter 로직 예시 (구현 시 참고)
 * getTotalAtk() {
 *    return (this.atk + this.bonusAtk + this.equipAtk) * (this.atkMult || 1);
 * }
 */
