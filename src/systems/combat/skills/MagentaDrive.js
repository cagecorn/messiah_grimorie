import Logger from '../../../utils/Logger.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
// [MOVE] projectileManager import removed to break circular dependency

/**
 * 궁극기: 마젠타 드라이브 (Magenta Drive)
 * 역할: [킹 전용 화면 횡단 돌진기]
 */
class MagentaDrive {
    constructor() {
        this.id = 'MagentaDrive';
        this.isUltimate = true;
    }

    /**
     * 궁극기 실행
     */
    execute(attacker) {
        if (!attacker || !attacker.logic.isAlive) return;

        Logger.info("ULTIMATE", `${attacker.logic.name} cast MAGENTA DRIVE!`);

        // [FIX] Circular dependency: Use scene reference or dynamic import
        const pm = attacker.scene ? attacker.scene.projectileManager : null;
        if (!pm) {
            Logger.error("SKILL", "ProjectileManager not found in scene!");
            return;
        }

        const projectile = pm.fire('magenta_drive', attacker, null, {
            multiplier: 3.5 // 궁극기 데미지 배율
        });

        if (projectile) {
            // [NEW] 궁극기 컷씬 출력
            ultimateCutsceneManager.show('king', 'Magenta Drive');
            // 연출용 컷신이나 일시 정지 효과가 필요하면 여기서 처리 가능
        }

        return true;
    }
}

const magentaDrive = new MagentaDrive();
export default magentaDrive;
