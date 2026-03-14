import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';

/**
 * 근접 AI 노드 (Melee AI Node)
 * 역할: [전사 계열의 전진 및 근거리 전투 사고]
 */
class MeleeAI {
    /**
     * AI 로직 실행
     * @param {CombatEntity} entity 
     * @param {AIBlackboard} bb 
     * @param {number} delta 
     */
    static execute(entity, bb, delta) {
        if (!entity.logic.isAlive) return;

        // [Robust Fix] 행동 불가 상태(stunned, airborne 등)일 경우 AI 사고 중단
        if (entity.status && entity.status.isUnableToAct()) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        const target = bb.get('target');
        
        // 1. 타겟이 없으면 대기
        if (!target || !target.logic.isAlive) {
            entity.moveDirection = { x: 0, y: 0 };
            bb.set('state', 'idle');
            return;
        }

        // 2. 타겟과의 거리 계산
        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, target.x, target.y);
        const atkRange = entity.logic.getTotalAtkRange();

        // 3. 행동 결정
        if (dist > atkRange) {
            // 공격 범위 밖: 추격
            const dx = target.x - entity.x;
            const dy = target.y - entity.y;
            
            const angle = Math.atan2(dy, dx);
            entity.moveDirection = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            };
            
            bb.set('state', 'move');
        } else {
            // 공격 범위 안: 정지 및 공격 수행
            entity.moveDirection = { x: 0, y: 0 };
            bb.set('state', 'attack');
            
            entity.attack(target);
        }
    }
}

export default MeleeAI;
