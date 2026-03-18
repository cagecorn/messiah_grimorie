import MeleeAI from './MeleeAI.js';
import JumpNode from './JumpNode.js';
import SinkingShadowAI from './SinkingShadowAI.js';
import Logger from '../../../utils/Logger.js';
import { ENTITY_CLASSES } from '../../../core/EntityConstants.js';

/**
 * 쉐도우맨서 전용 AI 노드 (Shadowmancer Specialized AI)
 * 역할: [그림자 이동 및 기습, 후방 우선 순위 타겟팅]
 * 
 * 설명: 로그의 변형 클래스로, 일반적인 로그의 암살 방식에 그림자 마법(Sinking Shadow)을 더합니다.
 */
class ShadowmancerAI {
    /**
     * @param {CombatEntity} entity 
     * @param {AIBlackboard} bb 
     * @param {number} delta 
     */
    static execute(entity, bb, delta) {
        if (!entity.logic.isAlive) return;

        // 1. 상태 체크 (행동 불가 시 혹은 행동 중(isBusy) 시 중단)
        if ((entity.status && entity.status.isUnableToAct()) || entity.isBusy) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        const scene = entity.scene;
        const opponents = (entity.team === 'mercenary') ? scene.enemies : scene.allies;

        // 2. 씽킹 섀도우(Sinking Shadow) 스킬 보유 시 우선 사용 체크
        // 적 밀집 지역이 있거나 전략적으로 필요할 때 잠영 시도
        if (entity.isSkillReady && entity.isSkillReady('sinking_shadow')) {
            if (SinkingShadowAI.update(entity, opponents)) {
                bb.set('state', 'skill');
                return true;
            }
        }

        // 3. 특수 타겟팅 (후방 클래스 우선: 위자드, 힐러, 바드)
        let currentTarget = bb.get('target');
        const priorityClasses = [ENTITY_CLASSES.WIZARD, ENTITY_CLASSES.HEALER, ENTITY_CLASSES.BARD];
        
        const isCurrentTargetPriority = currentTarget && 
                                        currentTarget.logic.isAlive && 
                                        priorityClasses.includes(currentTarget.logic.class.getClassName());

        let target = currentTarget;

        if (!isCurrentTargetPriority) {
            const priorityTarget = this.findPriorityTarget(entity, opponents);
            if (priorityTarget) {
                target = priorityTarget;
                bb.set('target', target);
            }
        }

        if (!target || !target.logic.isAlive) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 4. (REMOVED) 점프 스킬 체크 - 쉐도우맨서는 잠영만 사용하도록 제한

        // 5. 기본 근접 공격 로직 수행 (근접 클래스이므로)
        MeleeAI.execute(entity, bb, delta);
    }

    /**
     * 후방 클래스 중 가장 가까운 대상 선별
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
            if (opp.logic.status && opp.logic.status.states.stealthed) return; // 은신 중인 적 제외

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

export default ShadowmancerAI;
