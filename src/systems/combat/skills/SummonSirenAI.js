import summonSiren from './SummonSiren.js';

/**
 * 소환: 세이렌 AI (Summon: Siren AI)
 * 역할: [궁극기 게이지가 차면 자동으로 세이렌 소환/강화/회복 실행]
 */
class SummonSirenAI {
    /**
     * @param {CombatEntity} owner 
     */
    static update(owner) {
        if (!owner) return false;

        // 궁극기 게이지가 100% (1.0) 이상인 경우 실행
        if (owner.ultimateProgress >= 1.0) {
            summonSiren.execute(owner);
            return true;
        }

        return false;
    }
}

export default SummonSirenAI;
