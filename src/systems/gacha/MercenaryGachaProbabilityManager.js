import Logger from '../../../utils/Logger.js';

/**
 * 용병 가챠 확률 매니저 (Mercenary Gacha Probability Manager)
 * 역할: [용병 뽑기 확률 테이블 관리]
 */
class MercenaryGachaProbabilityManager {
    constructor() {
        // [HARDCODE-FREE] 나중에 외부 JSON이나 DB에서 가져오도록 확장 가능
        this.rates = {
            ssr: 0.02,  // 2%
            sr:  0.08,  // 8%
            r:   0.30,  // 30%
            n:   0.60   // 60%
        };
        Logger.system("MercenaryGachaProbabilityManager: Initialized.");
    }

    /**
     * 무작위 등급 결정
     */
    getRandomRarity() {
        const rand = Math.random();
        let cumulative = 0;

        for (const [rarity, rate] of Object.entries(this.rates)) {
            cumulative += rate;
            if (rand < cumulative) return rarity;
        }
        return 'n';
    }

    /**
     * 특정 등급 내에서 무작위 용병 결정 (나중에 구현)
     */
    getRandomUnitByRarity(rarity) {
        // [TODO] Registry나 전역 데이터에서 해당 등급의 유닛 리스트를 가져옴
        return { id: `unit_${rarity}_placeholder`, rarity: rarity };
    }
}

const mercenaryGachaProbabilityManager = new MercenaryGachaProbabilityManager();
export default mercenaryGachaProbabilityManager;
