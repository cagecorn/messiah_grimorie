import Logger from '../../utils/Logger.js';

/**
 * 엘리트 몬스터 매니저 (Elite Monster Manager)
 * 역할: [엘리트 몬스터의 생성 확률 및 스탯 강화 로직 관리]
 */
class EliteMonsterManager {
    constructor() {
        this.baseEliteChance = 0.05; // 기본 5%
        this.chanceIncreasePerRound = 0.005; // 라운드당 0.5% 증가
    }

    /**
     * 현재 라운드에 따른 엘리트 출현 확률 계산
     * @param {number} round 
     * @returns {number} 0.0 ~ 1.0 사이의 확률
     */
    getEliteChance(round) {
        // 라운드가 올라갈수록 확률이 선형적으로 증가
        const chance = this.baseEliteChance + (round - 1) * this.chanceIncreasePerRound;
        return Math.min(chance, 0.5); // 최대 50%로 캡핑 (밸런스 조절)
    }

    /**
     * 주사위를 굴려 엘리트가 뜰지 결정
     * @param {number} round 
     * @returns {boolean}
     */
    rollElite(round) {
        const chance = this.getEliteChance(round);
        const rand = Math.random();
        const isElite = rand < chance;

        if (isElite) {
            Logger.info("ELITE_SPAWN", `Elite monster rolled! (Chance: ${(chance * 100).toFixed(1)}%)`);
        }

        return isElite;
    }

    /**
     * 몬스터 설정에 엘리트 강화 적용
     * @param {Object} config 몬스터 초기 설정
     * @returns {Object} 강화된 설정
     */
    applyEliteModifications(config) {
        // [수정] 이름 변경은 MonsterManager.spawn에서 베이스 데이터와 결합된 후 처리하도록 위임
        
        // 1. 스탯 강화 (1.5배)
        if (config.baseStats) {
            const multiplier = 1.5;
            const statsToScale = ['atk', 'mAtk', 'maxHp', 'def', 'mDef'];
            
            statsToScale.forEach(key => {
                if (config.baseStats[key] !== undefined) {
                    config.baseStats[key] = Math.round(config.baseStats[key] * multiplier);
                }
            });
        }

        // 3. 엘리트 플래그 주입 (CombatEntity에서 비주얼 스케일링에 사용)
        config.isElite = true;

        return config;
    }
}

const eliteMonsterManager = new EliteMonsterManager();
export default eliteMonsterManager;
