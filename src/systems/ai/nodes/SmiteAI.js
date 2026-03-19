import Phaser from 'phaser';

/**
 * 스마이트 AI 노드 (Smite AI Node)
 * 역할: [가장 적이 많이 뭉친 곳을 타겟팅]
 */
class SmiteAI {
    static getBestTarget(entity, range = 800) {
        const scene = entity.scene;
        const enemies = scene.enemies || [];
        
        let bestPoint = null;
        let maxCount = 0;

        // 1. 범위 내의 모든 적을 후보지로 검토
        enemies.forEach(candidate => {
            if (!candidate.logic.isAlive) return;
            
            const dist = Phaser.Math.Distance.Between(entity.x, entity.y, candidate.x, candidate.y);
            if (dist > range) return;

            // 2. 해당 적 주변에 다른 적이 얼마나 있는지 카운트 (AOE 범위: 120)
            let count = 0;
            const aoeRadius = 120;
            
            enemies.forEach(other => {
                if (!other.logic.isAlive) return;
                const d = Phaser.Math.Distance.Between(candidate.x, candidate.y, other.x, other.y);
                if (d <= aoeRadius) count++;
            });

            if (count > maxCount) {
                maxCount = count;
                bestPoint = { x: candidate.x, y: candidate.y };
            }
        });

        return bestPoint;
    }
}

export default SmiteAI;
