import Logger from '../../../utils/Logger.js';
import combatManager from '../../CombatManager.js';

/**
 * 마젠타 드라이브 AI 노드 (Magenta Drive AI)
 * 역할: [궁극기 게이지가 가득 차고 적들이 일정 수 이상 모여있을 때 발동]
 */
export default class MagentaDriveAI {
    static minTargets = 3; // 최소 타겟 수
    static checkRange = 300; // 적군 밀집도 체크 범위

    /**
     * @param {CombatEntity} entity 
     */
    static execute(entity) {
        if (!entity.isUltimateReady()) return false;

        // 주변 적군 수 체크
        const enemies = combatManager.getUnitsInRange(entity.x, entity.y, this.checkRange)
            .filter(u => u.active && u.team !== entity.team && u.logic.isAlive);

        // 보스전의 경우 타겟 수와 상관없이 발사
        const hasBoss = enemies.some(e => e.logic.id.includes('boss'));

        if (enemies.length >= this.minTargets || hasBoss) {
            Logger.info("AI", `${entity.logic.name} decided to use MAGENTA DRIVE (Targets: ${enemies.length})`);
            entity.useUltimate(enemies[0]); 
            return true;
        }

        return false;
    }
}
