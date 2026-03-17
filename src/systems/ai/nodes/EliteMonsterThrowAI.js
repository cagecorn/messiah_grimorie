import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import coordinateManager from '../../combat/CoordinateManager.js';
import monsterNonTargetSkill from '../../combat/skills/MonsterNonTargetSkill.js';

/**
 * 엘리트 몬스터 던지기 AI 노드 (Elite Monster Throw AI Node)
 * 역할: [들고 있는 몬스터를 적(아군 용병) 밀집 지역으로 던지기 결정]
 */
class EliteMonsterThrowAI {
    /**
     * @param {CombatEntity} entity 시전자 (엘리트)
     * @param {Array<CombatEntity>} allies 아군 리스트 (엘리트의 적)
     */
    static update(entity, allies) {
        if (!entity || !entity.carriedEntity) return false;

        // 1. 살아있는 아군(용병) 필터링
        const activeAllies = allies.filter(a => a.active && a.logic.isAlive);
        if (activeAllies.length === 0) return false;

        // 2. 군집 분석 (가장 밀집된 아군 진영 찾기)
        let targetPoint = coordinateManager.getBestAOETarget(activeAllies, 150);
        
        // [UPGRADE] 밀집 지역을 찾기 힘들 때 (군집 타겟이 본인과 너무 가깝거나 유효하지 않은 경우 고려)
        // 사실 getBestAOETarget은 항상 좌표를 주지만, 명시적으로 '가장 가까운 적'을 우선시하는 간단한 로직 보강
        if (!targetPoint) {
            const nearest = entity.scene.physics.closest(entity, activeAllies);
            if (nearest) targetPoint = { x: nearest.x, y: nearest.y };
        }

        // 3. 사거리 확인 (던지기는 꽤 멀리 가능)
        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, targetPoint.x, targetPoint.y);
        
        if (dist > 10) {
            // 4. 던지기 실행
            const success = monsterNonTargetSkill.execute(entity, targetPoint);
            if (success) {
                Logger.info("AI", `${entity.logic.name} is throwing ${entity.carriedEntity?.logic?.name || 'monster'}!`);
                return true;
            }
        }

        return false;
    }
}

export default EliteMonsterThrowAI;
