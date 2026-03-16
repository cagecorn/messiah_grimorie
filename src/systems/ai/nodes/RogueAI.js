import MeleeAI from './MeleeAI.js';
import JumpNode from './JumpNode.js';
import Logger from '../../../utils/Logger.js';
import { ENTITY_CLASSES } from '../../../core/EntityConstants.js';

/**
 * 로그 전용 AI 노드 (Rogue Specialized AI)
 * 역할: [후방 우선 노리기 & 점프 접근]
 */
class RogueAI {
    static execute(entity, bb, delta) {
        if (!entity.logic.isAlive) return;

        // 1. 상태 체크 (행동 불가 시 혹은 행동 중(isBusy) 시 중단)
        if ((entity.status && entity.status.isUnableToAct()) || entity.isBusy) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        const scene = entity.scene;
        const opponents = (entity.team === 'mercenary') ? scene.enemies : scene.allies;

        // 2. 특수 타겟팅 (위자드, 힐러, 바드 우선 순우)
        let target = this.findPriorityTarget(entity, opponents);
        
        if (!target) {
            // 우선 순위 타겟이 없으면 가장 가까운 적
            target = bb.get('target');
        } else {
            // 우선 순위 타겟으로 블랙보드 갱신
            bb.set('target', target);
        }

        if (!target || !target.logic.isAlive) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 3. 점프 스킬 체크
        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, target.x, target.y);
        if (dist > 200 && !entity.isBusy) {
            if (JumpNode.execute(entity, target)) {
                return; // 점프 시작했으면 이번 프레임 로직 종료
            }
        }

        // 4. 기본 근접 공격 로직 수행
        MeleeAI.execute(entity, bb, delta);
    }

    /**
     * 후방 클래스(위자드, 힐러, 바드) 중 가장 가까운 대상 선별
     */
    static findPriorityTarget(entity, opponents) {
        const priorityClasses = [
            ENTITY_CLASSES.WIZARD,
            ENTITY_CLASSES.HEALER,
            ENTITY_CLASSES.BARD
        ];

        let bestTarget = null;
        let minDist = 800; // 최대 인지 범위

        opponents.forEach(opp => {
            if (!opp.logic.isAlive || !opp.active) return;

            const oppClass = opp.logic.class.getClassName();
            if (priorityClasses.includes(oppClass)) {
                const dist = Phaser.Math.Distance.Between(entity.x, entity.y, opp.x, opp.y);
                if (dist < minDist) {
                    minDist = dist;
                    bestTarget = opp;
                }
            }
        });

        return bestTarget;
    }
}

export default RogueAI;
