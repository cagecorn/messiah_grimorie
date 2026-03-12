/**
 * 근접 AI (Melee AI)
 * 전략: 가장 가까운 적을 추적하고 사거리 내에서 공격
 */
export default class MeleeAI {
    execute(self, aiBb, combatBb, deltaTime) {
        // 1. 타겟 검색 (가장 가까운 적)
        // [TODO] WorldContext/EntityManager 연동 필요
        
        // 2. 사거리 체크
        const target = aiBb.get('target');
        if (!target) return;

        const dist = this.getDistance(self, target);
        const range = self.getTotalAtkRange();

        if (dist > range) {
            // 추격 상태
            aiBb.set('state', 'move');
            aiBb.set('moveTarget', { x: target.x, y: target.y });
        } else {
            // 공격 상태
            aiBb.set('state', 'attack');
            // 공격 로직 실행 (behaviors/warrior.js 등)
        }
    }

    getDistance(a, b) {
        // 임시 거리 계산 (좌표 시스템 연동 전)
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) || 999;
    }
}
