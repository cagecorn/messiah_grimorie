import Logger from '../../../utils/Logger.js';

/**
 * 실비 궁극기 AI 노드 (Silvi Ultimate AI Node)
 * 역할: [궁극기 게이지가 가득 차면 즉시 시전]
 */
class ImSorryAI {
    /**
     * @param {CombatEntity} entity 
     */
    static update(entity) {
        if (!entity || !entity.active) return false;

        // 궁극기 사용 가능 여부 체크
        if (entity.isUltimateReady()) {
            Logger.info("AI", `${entity.logic.name} is using ULTIMATE: I'm Sorry!!`);
            
            // 시전 시 타겟 위치는 자기 자신 주변 (애니메이션에서 이동 방지)
            entity.useUltimate({ x: entity.x, y: entity.y });
            
            // 시전 중 이동 멈춤
            entity.moveDirection = { x: 0, y: 0 };
            return true;
        }

        return false;
    }
}

export default ImSorryAI;
