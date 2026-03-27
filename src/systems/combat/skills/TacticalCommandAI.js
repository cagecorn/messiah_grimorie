/**
 * 전술지휘 AI (Tactical Command AI)
 */
class TacticalCommandAI {
    /**
     * 스킬 사용 여부 결정
     */
    decide(owner) {
        // 전술지휘는 쿨타임이 되면 바로바로 사용 (Buff 성격)
        return true;
    }
}

const tacticalCommandAI = new TacticalCommandAI();
export default tacticalCommandAI;
