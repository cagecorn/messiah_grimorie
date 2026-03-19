import Phaser from 'phaser';
import coordinateManager from '../../combat/CoordinateManager.js';

/**
 * 바오 스킬 AI: 스톤 블래스트 (Stone Blast AI)
 * 역할: [적 밀집 구역에 바위 투척 조준]
 */
class SkillStoneBlastAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Array} enemies 
     * @returns {boolean} 스킬 발동 여부
     */
    static tick(entity, enemies) {
        if (!entity || !entity.skills || !enemies || enemies.length === 0) return false;

        // 1. 쿨다운 확인
        if (!entity.isSkillReady('StoneBlast')) return false;

        // 2. 타겟팅: 가장 밀집된 지점 분석 (반경 120)
        const targetPoint = coordinateManager.getBestAOETarget(enemies, 120);
        
        if (targetPoint.x === 0 && targetPoint.y === 0) return false;

        // 3. 스킬 실행
        entity.useSkill('StoneBlast', targetPoint);
        
        return true;
    }
}

export default SkillStoneBlastAI;
