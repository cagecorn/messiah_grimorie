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
            // 표준 궁극기 발동 방식 사용 (컷씬 연동 및 게이지 리셋 자동화)
            owner.skills.useUltimate();
            return true;
        }

        return false;
    }
}

export default SummonSirenAI;
