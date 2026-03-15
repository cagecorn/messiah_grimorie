import Logger from '../../../utils/Logger.js';

/**
 * 액션 선택 노드 (Action Selector Node)
 * 역할: [이동, 공격, 구르기 중 현재 상황에 가장 적합한 행동을 선택]
 * 
 * 우선순위:
 * 1. 생존 행동 (구르기): 위험 감지 시 최우선
 * 2. 공격 행동: 사거리 내 적 존재 시
 * 3. 이동 행동: 적 추적 또는 대열 복귀
 */
export default class ActionSelector {
    constructor(rollingNode) {
        this.rollingNode = rollingNode;
    }

    /**
     * 행동 선택 및 실행
     * @param {CombatEntity} entity 행동 주체
     * @param {Array} threats 감지된 투사체 위협 정보
     * @param {CombatEntity} target 현재 타겟
     */
    evaluate(entity, threats, target) {
        // [1순위] 구르기 (생존)
        if (this.rollingNode && threats && threats.length > 0) {
            const success = this.rollingNode.execute(entity, threats);
            if (success) return 'roll';
        }

        // 구르기 중이거나 쿨타임 중이면 AI 루틴 일시 중단 (이동 중이므로)
        if (entity.isRolling()) return 'rolling_in_progress';

        // [2순위] 공격 또는 기본 AI 루틴으로 제어권 반환
        return 'default';
    }
}
