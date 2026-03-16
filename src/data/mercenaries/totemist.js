import Logger from '../../utils/Logger.js';
import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 토템술사 클래스 정의 (Totemist Class definition)
 * 역할: [토템을 통해 화력을 투사하는 전술가]
 */
class Totemist {
    constructor() {
        this.name = 'totemist';
        this.baseId = 'totemist';
    }

    /**
     * 토템으로 스탯 전이 로직 (100% MAtk)
     * @param {CombatEntity} master 시전자
     * @param {object} totemStats 토템의 기본 스탯
     */
    applyTransfer(master, totemStats) {
        const mAtk = master.logic.getTotalMAtk ? master.logic.getTotalMAtk() : master.logic.stats.get(STAT_KEYS.M_ATK);
        totemStats[STAT_KEYS.M_ATK] = mAtk; // 100% 전이
        Logger.info("TOTEMIST", `Stats transferred to totem: MAtk ${mAtk}`);
    }
}

const totemist = new Totemist();
export default totemist;
