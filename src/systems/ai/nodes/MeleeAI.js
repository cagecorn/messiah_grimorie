import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';

/**
 * 근접 AI 노드 (Melee AI Node)
 * 역할: [전사 계열의 전진 및 근거리 전투 사고]
 * 
 * 설명: 타겟을 추적하여 공격 범위 내로 접근합니다.
 * 공격 범위(atkRange) 내에 도달하면 정지하고 공격 상태로 전환 준비를 합니다.
 */
class MeleeAI {
    /**
     * AI 로직 실행
     * @param {CombatEntity} entity 
     * @param {AIBlackboard} bb 
     * @param {number} delta 
     */
    static execute(entity, bb, delta) {
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
            
            // 정규화 (이동 방향 설정)
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
            
            // [신규] 기본 공격 실행 (내부 쿨다운 체크 포함)
            entity.attack(target);
        }
    }
}

export default MeleeAI;
