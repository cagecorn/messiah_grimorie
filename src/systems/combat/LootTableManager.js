import Logger from '../../utils/Logger.js';
import rewardScalingManager from './RewardScalingManager.js';

/**
 * 전역 테이블 풀 매니저 (Loot Table Manager)
 * 역할: [확률 기반 보상 정산기]
 * 
 * 설명: 몬스터 ID에 따른 드랍 테이블을 관리하고, 
 * 사망 시 주사위를 굴려 확정된 보상(골드, 아이템 등)을 산출합니다.
 */
class LootTableManager {
    constructor() {
        this.tables = new Map();
        this.initDefaultTables();
    }

    /**
     * 기본 테이블 로드 (나중에 외부 JSON 등으로 분리 가능)
     */
    initDefaultTables() {
        this.register('goblin_common', {
            gold: { min: 10, max: 25 },
            drops: [
                { id: '🪵', chance: 0.2 }
            ]
        });

        this.register('goblin_shaman', {
            gold: { min: 30, max: 60 },
            drops: [
                { id: '🪵', chance: 0.4 }
            ]
        });

        Logger.system("LootTableManager: Initialized with Gold-only tables (Item expansion ready).");
    }

    /**
     * 새로운 드랍 테이블 등록
     */
    register(id, config) {
        this.tables.set(id, config);
    }

    /**
     * 주사위 굴리기 (보상 확정)
     * @param {string} tableId 
     * @param {number} level 몬스터 레벨 (스케일링용)
     * @returns {object} { gold: number, items: string[] }
     */
    roll(tableId, level = 1) {
        const table = this.tables.get(tableId);
        if (!table) {
            Logger.warn("LOOT", `Table ID not found: ${tableId}`);
            return { gold: 0, items: [] };
        }

        // 1. 골드 산출 (스케일링 적용)
        const scaled = rewardScalingManager.calculateScaledGold(table.gold.min, table.gold.max, level);
        const gold = Math.floor(Math.random() * (scaled.max - scaled.min + 1)) + scaled.min;

        // 2. 아이템 산출
        const items = [];
        if (table.drops) {
            table.drops.forEach(drop => {
                if (Math.random() < drop.chance) {
                    items.push(drop.id);
                }
            });
        }

        return { gold, items };
    }
}

const lootTableManager = new LootTableManager();
export default lootTableManager;
