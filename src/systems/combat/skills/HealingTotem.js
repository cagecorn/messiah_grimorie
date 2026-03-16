import Logger from '../../../utils/Logger.js';
import combatManager from '../../CombatManager.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import localizationManager from '../../../core/LocalizationManager.js';

/**
 * 치유 토템 소환 (Summon Healing Totem) - 주주의 궁극기
 */
class HealingTotem {
    constructor() {
        this.scalingStat = 'mAtk';
    }

    execute(owner) {
        if (!owner || !owner.active) return;

        // 컷씬 출력
        const ultName = localizationManager.t('ult_joojoo_name');
        ultimateCutsceneManager.show('joojoo', ultName);

        Logger.info("ULTIMATE", `[Joojoo] Summoning Healing Totem!`);
        combatManager.spawnSpecialTotem(owner, 'healing');
    }
}

const healingTotem = new HealingTotem();
export default healingTotem;
