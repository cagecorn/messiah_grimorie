import Logger from '../../../utils/Logger.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import CarpetBombingAI from './CarpetBombingAI.js';

/**
 * 레오나 궁극기: 융단폭격 (Carpet Bombing)
 * 역할: [하늘을 횡단하는 비행기가 지상으로 미사일을 투하하여 광역 물리 피해]
 */
class CarpetBombing {
    constructor() {
        this.id = 'CarpetBombing';
        this.name = 'Carpet Bombing';
        this.isUltimate = true;
        this.atkMultiplier = 4.5; // 총 데미지 기대값 (여러발의 미사일 합산)
        this.scalingStat = 'atk';
    }

    execute(attacker) {
        if (!attacker || !attacker.logic.isAlive) return;

        Logger.info("ULTIMATE", `${attacker.logic.name} cast CARPET BOMBING!`);

        // 1. 타겟 지점 결정 (적이 가장 뭉친 곳)
        const targetPoint = CarpetBombingAI.decideBombingTarget(attacker);
        if (!targetPoint) {
            Logger.warn("SKILL", "No targets found for Carpet Bombing.");
            return false;
        }

        // 2. 투사체 매니저 확보
        const pm = attacker.scene ? attacker.scene.projectileManager : null;
        if (!pm) {
            Logger.error("SKILL", "ProjectileManager not found in scene!");
            return false;
        }

        // 3. 궁극기 컷씬 출력
        ultimateCutsceneManager.show('leona', 'Carpet Bombing');

        // 4. 비행기 투사체(Plane) 발사
        // 비행기는 화면 횡단형이므로 targetPoint를 중심으로 궤적을 그림
        pm.fire('carpet_bombing', attacker, null, {
            targetX: targetPoint.x,
            targetY: targetPoint.y,
            multiplier: this.atkMultiplier
        });

        return true;
    }
}

const carpetBombing = new CarpetBombing();
export default carpetBombing;
