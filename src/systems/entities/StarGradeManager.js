import Logger from '../../utils/Logger.js';

/**
 * 성급 매니저 (Star Grade Manager)
 * 역할: [엔티티의 성급(Star) 관리 및 스탯 배율 계산]
 * 
 * 공식: 배수 = 1.5 ^ (별의 개수 - 1)
 */
class StarGradeManager {
    constructor() {
        this.stars = 1;
        this.maxStars = 5;
    }

    /**
     * 초기화
     * @param {number} stars 초기 성급 (기본 1)
     */
    init(stars = 1) {
        this.stars = Math.max(1, Math.min(stars, this.maxStars));
    }

    /**
     * 성급 상승 (진급/합성)
     */
    promote() {
        if (this.stars < this.maxStars) {
            this.stars++;
            Logger.info("ENTITY_PROMOTION", `Promoted to ${this.stars} stars!`);
            return true;
        }
        return false;
    }

    /**
     * 성급에 따른 멀티플라이어 계산
     * 1성: 1.0x
     * 2성: 1.5x
     * 3성: 2.25x
     */
    getMultiplier() {
        return Math.pow(1.5, this.stars - 1);
    }

    getStars() {
        return this.stars;
    }
}

export default StarGradeManager;
