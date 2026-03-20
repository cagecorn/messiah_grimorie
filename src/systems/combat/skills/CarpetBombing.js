import Logger from '../../../utils/Logger.js';

/**
 * 레오나 궁극기: 융단폭격 (Carpet Bombing - Placeholder)
 * 역할: [화면을 가로지르는 광역 화상 폭격]
 */
class CarpetBombing {
    constructor() {
        this.id = 'CarpetBombing';
        this.name = 'Carpet Bombing';
        this.atkMultiplier = 3.5;
        this.scalingStat = 'atk';
    }

    execute(owner, target) {
        Logger.info("SKILL", `[Leona] Carpet Bombing requested! (Placeholder)`);
        // TODO: 구현 예정
        return true;
    }
}

const carpetBombing = new CarpetBombing();
export default carpetBombing;
