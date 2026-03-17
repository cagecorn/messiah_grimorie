import Logger from '../../../utils/Logger.js';

/**
 * 토네이도 샷 (Tornado Shot) - Placeholder
 * 역할: [소용돌이 치며 소형 구체들을 연사함]
 */
class TornadoShot {
    constructor() {
        this.id = 'tornado_shot';
        this.name = 'Tornado Shot';
        this.cooldown = 10000; 
        this.damageMultiplier = 1.0;
        this.scalingStat = 'atk';
    }

    execute(owner, target) {
        if (!owner || !target) return;
        Logger.info("SKILL", `[Sein] Tornado Shot placeholder execution!`);
    }
}

const tornadoShot = new TornadoShot();
export default tornadoShot;
