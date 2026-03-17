import Logger from '../../../utils/Logger.js';
import DashAI from './DashAI.js';
import EscapeAI from './EscapeAI.js';

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
        // [1순위] 구르기 또는 대쉬 (생존)
        const isFlying = entity.logic.status && entity.logic.status.states && entity.logic.status.states.flying;
        
        if (isFlying) {
            // [FLYING] 비행 중일 때는 구르기 대신 대쉬로 회피 (적이 근접했을 때)
            const opponents = (entity.team === 'mercenary') ? entity.scene.enemies : entity.scene.allies;
            if (DashAI.tick(entity, opponents)) return 'dash';
        } else {
            // [SURVIVAL] 지상 유닛의 적 근접 시 구르기 탈출 (Healer, Wizard, Bard)
            const opponents = (entity.team === 'mercenary') ? entity.scene.enemies : entity.scene.allies;
            if (EscapeAI.tick(entity, opponents)) return 'roll';

            // [PROJ EVASION] 기존 투사체 회피
            if (this.rollingNode && threats && threats.length > 0) {
                const success = this.rollingNode.execute(entity, threats);
                if (success) return 'roll';
            }
        }

        // 동작 중이면 AI 루틴 일시 중단
        if ((entity.isRolling && entity.isRolling()) || (entity.isDashing && entity.isDashing())) {
            return 'action_in_progress';
        }

        // [2순위] 공격 또는 기본 AI 루틴으로 제어권 반환
        return 'default';
    }
}
