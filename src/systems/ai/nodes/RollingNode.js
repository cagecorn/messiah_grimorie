import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import ProjectileClassifier from './ProjectileClassifier.js';

/**
 * 구르기 실행 노드 (Rolling Node)
 * 역할: [위협 정보를 바탕으로 적절한 방향으로 구르기 실행]
 */
export default class RollingNode {
    /**
     * 구르기 실행 조건 판단
     */
    execute(entity, threats) {
        if (!entity || !entity.active || entity.isRolling()) return false;

        // [예외] 소드마스터는 패링 처리, 쉐도우맨서는 잠영 충돌 방지를 위해 구르지 않음
        const className = entity.logic.class.getClassName();
        if (className === 'swordmaster' || className === 'shadowmancer') return false;

        // 1. 투사체 위협 분석 (Classifier 활용)
        // 센서에서 온 원본 투사체 리스트를 하나씩 분석하여 가장 위험한 것을 찾음
        let activeThreat = null;
        for (const projData of threats) {
            const analysis = ProjectileClassifier.analyze(entity, projData);
            
            // [FIX] 타겟팅(유도) 투사체는 구르기로 피할 수 없으므로 무시 (스태미나 절약)
            if (analysis.isThreat && analysis.type !== 'target') {
                activeThreat = analysis;
                break; // 가장 가까운 회피 가능한 위협부터 처리
            }
        }

        if (!activeThreat) return false;

        // 2. 스태미나 체크 (액션 컴포넌트 내부에서도 하지만 AI 레벨에서도 체크)
        if (!entity.stamina || entity.stamina.currentStamina < 30) return false;

        // 3. 회피 방향 결정 (Classifier에서 계산된 dodgeDir 사용)
        const rollDir = activeThreat.dodgeDir || this.fallbackDirection(entity, activeThreat.projectile);
        
        // 4. 구르기 실행
        return entity.roll(rollDir);
    }

    /**
     * 분석에서 방향을 찾지 못했을 때의 백업 로직
     */
    fallbackDirection(entity, proj) {
        if (!proj || !proj.body) return { x: 1, y: 0 };
        const vx = proj.body.velocity.x;
        const vy = proj.body.velocity.y;
        return { x: -vy, y: vx }; // 수직 방향
    }
}
