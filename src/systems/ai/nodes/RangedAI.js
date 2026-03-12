/**
 * 원거리 AI (Ranged AI)
 * 전략: 카이팅 (적과 일정 거리 유지하며 원거리 공격)
 */
export default class RangedAI {
    execute(self, aiBb, combatBb, deltaTime) {
        const target = aiBb.get('target');
        if (!target) return;

        const dist = this.getDistance(self, target);
        const rangeMin = self.stats.get('rangeMin') || 150;
        const rangeMax = self.getTotalAtkRange();

        if (dist < rangeMin) {
            // 너무 가까움 -> 뒤로 후퇴 (Flee/Kiting)
            aiBb.set('state', 'flee');
            // 후퇴 좌표 계산 로직
        } else if (dist > rangeMax) {
            // 너무 멈 -> 추격
            aiBb.set('state', 'move');
        } else {
            // 사거리 내 존재 -> 공격
            aiBb.set('state', 'attack');
        }
    }

    getDistance(a, b) { return 999; } // Placeholder
}
