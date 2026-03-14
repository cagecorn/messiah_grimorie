import Logger from '../../utils/Logger.js';
import EventBus, { EVENTS } from '../../core/EventBus.js';

/**
 * 레벨링 매니저 (Leveling Manager)
 * 역할: [엔티티의 레벨, 경험치, 성장 주기 관리]
 */
class LevelingManager {
    constructor() {
        this.level = 1;
        this.exp = 0;
        this.maxExp = 100;
        this.totalExp = 0;
        this.entityId = null;
    }

    init(level = 1, exp = 0, entityId = '') {
        this.level = level;
        this.exp = exp;
        this.entityId = entityId;
        this.updateMaxExp();
    }

    /**
     * 다음 레벨까지 필요한 경험치 계산 (곡선)
     */
    updateMaxExp() {
        // [BALANCE] 레벨당 요구 경험치 공식화
        // Lv 1: 100, Lv 10: 5,011, Lv 50: 77,508 (대략적 수치)
        const base = 100;
        this.maxExp = Math.floor(base * Math.pow(this.level, 1.7));
    }

    /**
     * 경험치 획득
     * @returns {boolean} 레벨업 발생 여부
     */
    gainExp(amount) {
        this.exp += amount;
        this.totalExp += amount;
        
        let leveledUp = false;
        while (this.exp >= this.maxExp) {
            this.exp -= this.maxExp;
            this.level++;
            this.updateMaxExp();
            leveledUp = true;
        }

        if (leveledUp) {
            Logger.info("ENTITY_LEVEL", `Entity ${this.entityId} leveled up to ${this.level}!`);
            EventBus.emit(`ENTITY_LEVEL_UP_${this.entityId}`, { level: this.level });
        }

        return leveledUp;
    }

    getLevel() {
        return this.level;
    }

    getExpProgress() {
        return this.exp / this.maxExp;
    }
}

export default LevelingManager;
