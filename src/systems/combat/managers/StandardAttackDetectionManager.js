/**
 * 평타 감지 매니저 (Standard Attack Detection Manager)
 * 역할: [평타 여부 판별]
 * 
 * 설명: 닉클의 '전술지휘' 등 평타 강화 효과를 적용하기 위해 
 * 현재 공격이나 스킬이 '평타' 카테고리에 속하는지 판별합니다.
 */
class StandardAttackDetectionManager {
    constructor() {
        // 평타로 간주되는 투사체 키 목록
        this.standardProjectileKeys = [
            'melee',
            'arrow',
            'bullet',
            'bard',
            'light',
            'wizard',
            'aqua_burst' // 시렌의 평타이자 힐러의 평타 힐 투사체
        ];
    }

    /**
     * 투사체 키가 평타인지 확인
     */
    isStandardProjectile(key) {
        return this.standardProjectileKeys.includes(key);
    }

    /**
     * 해당 엔티티가 '전술지휘' 버프를 가지고 있는지 확인하고 배율 반환
     * @param {CombatEntity} entity 
     * @returns {number} 추가 배율 (없으면 1.0)
     */
    getTacticalMultiplier(entity) {
        if (!entity || !entity.logic || !entity.logic.buffs) return 1.0;
        
        const hasBuff = entity.logic.buffs.activeBuffs.some(b => b.id === 'tactical_command');
        return hasBuff ? 1.5 : 1.0;
    }
}

const standardAttackDetectionManager = new StandardAttackDetectionManager();
export default standardAttackDetectionManager;
