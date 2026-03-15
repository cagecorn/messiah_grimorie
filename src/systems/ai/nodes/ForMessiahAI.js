import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import coordinateManager from '../../combat/CoordinateManager.js';

/**
 * 포 메시아 AI 노드 (For Messiah AI Node)
 * 역할: [궁극기 게이지가 가득 찼을 때 가장 밀집된 적진으로 사용]
 */
class ForMessiahAI {
    /**
     * @param {CombatEntity} entity 시전자
     * @param {Array<CombatEntity>} enemies 적군 리스트
     */
    static update(entity, enemies) {
        // 1. 궁극기 가능 여부 및 게이지 체크
        if (!entity.hasUltimate || entity.ultimateProgress < 1.0) return false;

        // 2. 살아있는 적 필터링
        const activeEnemies = enemies.filter(e => e.active && e.logic.isAlive);
        if (activeEnemies.length === 0) return false;

        // 3. 군집 분석 (가장 밀집된 적진의 타겟 점 찾기) (반경 200)
        const targetPoint = coordinateManager.getBestAOETarget(activeEnemies, 200);

        // 4. 사거리 확인 (궁극기는 전장 어디든 가능하도록 넉넉히 설정)
        // 화면 밖 점프이므로 사거리 제약은 크게 없으나 최소 거리는 둠
        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, targetPoint.x, targetPoint.y);
        
        if (dist > 50) {
            // 5. 궁극기 실행
            if (entity.skills.useUltimate(targetPoint)) {
                Logger.info("AI", `${entity.logic.name} decided to use ULTIMATE!`);
                return true; // 행동 선점
            }
        }

        return false;
    }
}

export default ForMessiahAI;
