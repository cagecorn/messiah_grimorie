import MeleeAI from './MeleeAI.js';

/**
 * 바바오 전용 AI 노드 (Babao AI Node)
 * 역할: [근접 전사로서 적에게 돌진하여 공격]
 * 특성: MeleeAI 활용하여 기본 행동 수행
 */
class BabaoAI {
    static execute(entity, bb, delta) {
        // [FIX] 궁극기 시전 중(투사체에 태워진 상태)에는 일반 AI 중단
        if (entity.isBeingCarried) return;

        // 기본 MeleeAI 로직 사용 (타겟 추적 및 근접 공격)
        MeleeAI.execute(entity, bb, delta);
    }
}

export default BabaoAI;
