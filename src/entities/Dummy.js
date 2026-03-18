/**
 * 더미 유틸리티 (Dummy Utility)
 * 역할: [전투 엔티티 인터페이스 표준 가상화]
 * 
 * 설명: 
 * 그림자 투사체 등 일시적으로 아군/적군 리스트에 포함되어야 하지만 
 * 실제 CombatEntity는 아닌 객체들이 각종 매니저와 충돌하는 것을 방지합니다.
 */
export default class Dummy {
    /**
     * 표준 엔티티 로직 객체 생성
     */
    static createLogic(id = 'dummy', name = 'Shadow') {
        return {
            id: id,
            baseId: 'dummy_base',
            name: name,
            type: 'summon',
            isAlive: true,
            hp: 1,
            stats: { 
                get: () => 0,
                finalStats: { hp: 1 } 
            },
            class: { getClassName: () => 'dummy' },
            status: { states: {} },
            leveling: { 
                gainExp: () => {}, 
                getLevel: () => 1 
            },
            buffs: { 
                activeBuffs: [], 
                addBuff: () => {}, 
                removeBuff: () => {},
                find: () => null
            },
            shields: { 
                addShield: () => {}, 
                removeShield: () => {} 
            },
            // [Combat Constants 기반 표준 Getter]
            getTotalMaxHp: () => 1,
            getTotalAtk: () => 0,
            getTotalMAtk: () => 0,
            getTotalCrit: () => 0,
            getTotalDef: () => 0,
            getTotalMDef: () => 0,
            getTotalEva: () => 0,
            getTotalSpeed: () => 0,
            getTotalAtkSpd: () => 0,
            getTotalAcc: () => 0,
            getTotalDR: () => 0
        };
    }

    /**
     * 대상 객체(Container 등)에 표준 엔티티 메서드 믹스인
     */
    static applyMethods(target) {
        const noop = () => {};
        const returnFalse = () => false;

        // [BattleScene/Manager 업데이트 루프 대응]
        if (target.updateDepth === undefined) target.updateDepth = noop;
        if (target.updateAttackCooldown === undefined) target.updateAttackCooldown = noop;
        
        // [이동 관련]
        if (target.stop === undefined) target.stop = noop;
        if (target.setVelocity === undefined) target.setVelocity = noop;
        if (target.isRolling === undefined) target.isRolling = returnFalse;
        if (target.isDashing === undefined) target.isDashing = returnFalse;
        
        // [전투 관련]
        if (target.attack === undefined) target.attack = noop;
        if (target.heal === undefined) target.heal = noop;
        if (target.takeDamage === undefined) target.takeDamage = noop;
        if (target.handleDeath === undefined) target.handleDeath = noop;
        if (target.gainUltimateCharge === undefined) target.gainUltimateCharge = noop;
        
        // [정보창/HUD 관련]
        if (target.hpBar === undefined) target.hpBar = { isDirty: false };

        // [비주얼/피격 관련]
        if (target.sprite === undefined) target.sprite = { scaleX: 1, scaleY: 1, visible: true };
        if (target.isInvincible === undefined) target.isInvincible = returnFalse;
    }
}
