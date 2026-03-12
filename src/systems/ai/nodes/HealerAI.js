/**
 * 힐러 AI (Healer AI)
 * 전략: 아군 HP 감시 -> 힐 우선 -> 적 공격
 */
export default class HealerAI {
    execute(self, aiBb, combatBb, deltaTime) {
        // 1. 아군 상태 체크 (가장 피가 적은 아군)
        const weakestAlly = null; // [TODO] TeamManager 연동
        
        if (weakestAlly && weakestAlly.hp < weakestAlly.getTotalMaxHp() * 0.8) {
            // 힐 모드
            aiBb.set('target', weakestAlly);
            aiBb.set('state', 'heal');
            return;
        }

        // 2. 힐할 대상이 없으면 적 공격 (Ranged AI와 유사)
        aiBb.set('state', 'attack');
    }
}
