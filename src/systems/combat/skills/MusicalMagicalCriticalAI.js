import coordinateManager from '../CoordinateManager.js';

/**
 * 나나 스킬 AI: 뮤지컬 매지컬 크리티컬 (Musical Magical Critical AI)
 * 역할: [아군이나 적군이 가장 많이 뭉쳐있는 최적의 지점 검색]
 */
class MusicalMagicalCriticalAI {
    /**
     * 최적의 타격 지점 결정
     * @param {CombatEntity} owner 시전자
     * @param {number} radius 분석 반경
     */
    static decideTarget(owner, radius = 180) {
        if (!owner) return null;
        
        const scene = owner.scene;
        const enemies = (owner.team === 'mercenary' || owner.team === 'ally') ? scene.enemies : scene.allies;
        const allies = (owner.team === 'mercenary' || owner.team === 'ally') ? scene.allies : scene.enemies;

        // 1. 적군 밀집 지역 검색
        const enemyTarget = this.evaluateTargetDensity(enemies, radius);
        
        // 2. 아군 밀집 지역 검색 (자신 제외)
        const allyTarget = this.evaluateTargetDensity(allies.filter(a => a !== owner), radius);

        // 3. 더 효율적인 지점 선택 (동률일 경우 적군 우선)
        if (allyTarget.count > enemyTarget.count) {
            return allyTarget.point;
        } else if (enemyTarget.count > 0) {
            return enemyTarget.point;
        }

        // 4. 주변에 아무도 없다면 시전자 발밑
        return { x: owner.x, y: owner.y };
    }

    /**
     * 특정 그룹에서 가장 밀집도가 높은 지점과 유닛 수 반환
     */
    static evaluateTargetDensity(units, radius) {
        if (!units || units.length === 0) return { count: 0, point: null };

        let maxCount = 0;
        let bestPoint = null;

        units.forEach(candidate => {
            if (!candidate.active || !candidate.logic.isAlive) return;

            let count = 0;
            units.forEach(other => {
                if (!other.active || !other.logic.isAlive) return;
                
                const dx = candidate.x - other.x;
                const dy = candidate.y - other.y;
                if (dx * dx + dy * dy < radius * radius) {
                    count++;
                }
            });

            if (count > maxCount) {
                maxCount = count;
                bestPoint = { x: candidate.x, y: candidate.y };
            }
        });

        return { count: maxCount, point: bestPoint };
    }
}

export default MusicalMagicalCriticalAI;
