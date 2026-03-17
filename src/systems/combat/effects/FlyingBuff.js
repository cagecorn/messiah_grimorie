import Logger from '../StatusEffectManager.js'; // 실제 경로는 context에 따라 다를 수 있으나 관습적으로 StatusEffectManager와 같은 경로에 배치

/**
 * 비행 버프 (Flying Buff)
 * 역할: [유닛을 비행 상태로 전환하고 시각적 아이콘 표시]
 */
class FlyingBuff {
    /**
     * 비행 상태 적용
     * @param {CombatEntity} target 
     */
    static apply(target) {
        if (!target || !target.logic || !target.logic.status) return;

        // 1. 상태 설정
        target.logic.status.states.flying = true;

        // 2. 비행 고도 설정 (그림자로부터 띄움)
        if (target.setHeight) {
            target.setHeight(60);
        }

        // 3. 애니메이션 갱신 (이미 바빙 중이면 멈추고 새로 시작)
        if (target.visual && target.visual.updateIdleState) {
            target.visual.isIdle = false; // 강제 트리거
            target.visual.updateIdleState();
        }

        const name = target.logic.name || "Unknown";
        console.log(`[FLYING] ${name} is now flying at height 60!`);
    }

    /**
     * 비행 상태 제거
     * @param {CombatEntity} target 
     */
    static remove(target) {
        if (!target || !target.logic || !target.logic.status) return;

        target.logic.status.states.flying = false;

        // 고도 착지
        if (target.setHeight) {
            target.setHeight(0);
        }

        // 애니메이션 원복
        if (target.visual && target.visual.updateIdleState) {
            target.visual.isIdle = false; 
            target.visual.updateIdleState();
        }
    }
}

export default FlyingBuff;
