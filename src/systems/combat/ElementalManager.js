import Logger from '../../utils/Logger.js';

/**
 * 속성 매니저 (Elemental Manager)
 * 역할: [무기 속성 및 공격 시너지 계산]
 */
class ElementalManager {
    constructor(owner) {
        this.owner = owner;
        this.weaponElement = 'none'; // 'fire', 'ice', 'lightning', etc.
    }

    setWeaponElement(element) {
        this.weaponElement = element;
    }

    /**
     * 공격 시 추가 타격(Secondary Hit) 발생 로직
     * @param {number} mainDamage 주 공격 데미지
     */
    calculateSecondaryHit(mainDamage) {
        if (this.weaponElement === 'none') return 0;

        // 공식: 주 공격력의 30% (기본) + 보너스(추후 확장)
        const secondaryDamage = mainDamage * 0.3;
        
        Logger.info("COMBAT", `Secondary ${this.weaponElement} hit: ${secondaryDamage.toFixed(1)}`);
        return secondaryDamage;
    }
}

export default ElementalManager;
