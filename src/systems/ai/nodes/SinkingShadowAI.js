import Logger from '../../../utils/Logger.js';

/**
 * 씽킹 섀도우 AI (Sinking Shadow AI)
 * 역할: [스킬 사용 조건 판단 - 적 밀집 지역 탐색]
 */
export default class SinkingShadowAI {
    /**
     * 스킬 사용 여부 업데이트
     */
    static update(entity, enemies) {
        if (!entity.isSkillReady('sinking_shadow')) return false;

        // 1. 적 밀집도가 높은 지점 찾기
        const targetPoint = this.findBestTargetPoint(entity, enemies);
        if (targetPoint) {
            entity.useSkill('sinking_shadow', targetPoint);
            return true;
        }

        return false;
    }

    /**
     * 가장 많은 적이 모여있는 지점 검색
     */
    static findBestTargetPoint(entity, enemies) {
        const activeEnemies = enemies.filter(e => e.active && e.logic.isAlive);
        if (activeEnemies.length === 0) return null;

        let bestPoint = null;
        let maxCount = 0;
        const checkRange = 100;

        // 간단한 밀집도 체크: 각 적의 위치를 중심으로 주변에 몇 명이 있는지 계산
        activeEnemies.forEach(e => {
            let count = 0;
            activeEnemies.forEach(other => {
                const dist = Phaser.Math.Distance.Between(e.x, e.y, other.x, other.y);
                if (dist <= checkRange) count++;
            });

            if (count > maxCount) {
                maxCount = count;
                bestPoint = { x: e.x, y: e.y };
            }
        });

        // 최소 2명 이상 모여있을 때만 사용 (혹은 스킬 사거리 내에 적이 있을 때)
        if (maxCount >= 2) {
            return bestPoint;
        }

        // 밀집 지역이 없으면 가장 가까운 적이라도 타겟팅
        const nearest = activeEnemies[0];
        const distToNearest = Phaser.Math.Distance.Between(entity.x, entity.y, nearest.x, nearest.y);
        
        if (distToNearest < 400) {
            return { x: nearest.x, y: nearest.y };
        }

        return null;
    }
}
