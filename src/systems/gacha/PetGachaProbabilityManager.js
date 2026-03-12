import Logger from '../../../utils/Logger.js';

/**
 * 펫 가챠 확률 매니저 (Pet Gacha Probability Manager)
 * 역할: [펫 뽑기 확률 테이블 관리]
 */
class PetGachaProbabilityManager {
    constructor() {
        this.rates = {
            ssr: 0.01,  // 1%
            sr:  0.05,  // 5%
            r:   0.20,  // 20%
            n:   0.74   // 74%
        };
        Logger.system("PetGachaProbabilityManager: Initialized.");
    }

    getRandomRarity() {
        const rand = Math.random();
        let cumulative = 0;

        for (const [rarity, rate] of Object.entries(this.rates)) {
            cumulative += rate;
            if (rand < cumulative) return rarity;
        }
        return 'n';
    }
}

const petGachaProbabilityManager = new PetGachaProbabilityManager();
export default petGachaProbabilityManager;
