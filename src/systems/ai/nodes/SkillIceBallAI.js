import Phaser from 'phaser';
import coordinateManager from '../../combat/CoordinateManager.js';

/**
 * 아이나 스킬 AI: 아이스볼 (Ice Ball AI)
 * 역할: [적 발견 시 아이스볼 스킬 발동]
 */
class SkillIceBallAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Array} enemies 
     * @returns {boolean} 스킬 발동 여부
     */
    static tick(entity, enemies) {
        if (!entity || !entity.skills || !enemies || enemies.length === 0) return false;

        // 1. 쿨다운 및 조건 확인 (ID는 소문자 'skilliceball')
        if (!entity.isSkillReady('skilliceball')) return false;

        // 2. 타겟팅: CoordinateManager를 통해 가장 밀집된 지점 분석 (반경 120)
        const targetPoint = coordinateManager.getBestAOETarget(enemies, 120);
        
        // 유효한 좌표인지 확인
        if (targetPoint.x === 0 && targetPoint.y === 0) return false;

        // 3. 스킬 실행
        entity.useSkill('skilliceball', targetPoint);
        
        return true;
    }
}

export default SkillIceBallAI;
