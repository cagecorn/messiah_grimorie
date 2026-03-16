import Phaser from 'phaser';

/**
 * Stationary AI 노드 (Stationary AI Node)
 * 역할: [움직이지 않고 제자리에서 공격만 수행]
 * 
 * 설명:
 * 1. 이동(moveDirection)을 항상 {x: 0, y: 0}으로 유지합니다.
 * 2. 사거리 내에 타겟이 있으면 공격을 시도합니다.
 */
class StationaryAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Blackboard} bb 
     */
    static execute(entity, bb) {
        entity.moveDirection = { x: 0, y: 0 };

        const target = bb.get('target');
        if (!target) return;

        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, target.x, target.y);
        const stats = entity.logic.stats;
        const rangeMax = stats.get('rangeMax') || 400;

        if (dist <= rangeMax) {
            // [신규] 스킬이 준비되었다면 스킬 우선 사용
            const skillId = entity.skillData ? entity.skillData.id : null;
            if (skillId && entity.isSkillReady(skillId)) {
                entity.useSkill(skillId, target);
            } else {
                // [신규] 힐러 클래스라면 체력이 낮은 아군을 우선적으로 찾음 (HealerAI 로직 차용)
                // 단, Stationary이므로 이미 블랙보드에 잡힌 타겟(가장 가까운 아군)을 주로 사용하되, 
                // CombatManager에서 팀 체크를 수행하므로 그대로 공격(힐) 시도
                entity.attack(target);
            }
        }
    }
}

export default StationaryAI;
