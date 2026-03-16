import Logger from '../../../utils/Logger.js';
import combatManager from '../../CombatManager.js';

/**
 * 화염 토템 소환 (Summon Fire Totem) - 주주의 스킬
 */
class FireTotem {
    constructor() {
        this.scalingStat = 'mAtk';
    }

    execute(owner) {
        if (!owner || !owner.active) return;
        Logger.info("SKILL", `[Joojoo] Summoning Fire Totem!`);
        combatManager.spawnSpecialTotem(owner, 'fire');
    }
}

const fireTotem = new FireTotem();
export default fireTotem;
