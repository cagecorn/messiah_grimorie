import Phaser from 'phaser';
import coordinateManager from '../../combat/CoordinateManager.js';

/**
 * 멀린 스킬 AI: 파이어볼 (Fireball AI)
 * 역할: [적 밀집 구역 조준 및 스킬 발동]
 */
class SkillFireballAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Array} enemies 
     * @returns {boolean} 스킬 발동 여부
     */
    static tick(entity, enemies) {
        if (!entity || !entity.skills || !enemies || enemies.length === 0) return false;

        // 1. 쿨다운 및 조건 확인 (ID는 소문자 'fireball')
        if (!entity.isSkillReady('fireball')) return false;

        // 2. 타겟팅: CoordinateManager를 통해 가장 밀집된 지점 분석 (반경 150)
        const targetPoint = coordinateManager.getBestAOETarget(enemies, 150);
        
        // 유효한 좌표인지 확인
        if (targetPoint.x === 0 && targetPoint.y === 0) return false;

        // 3. 스킬 실행 (CombatEntity에 추가된 프록시 사용)
        entity.useSkill('fireball', targetPoint);
        
        return true;
    }
}

export default SkillFireballAI;
