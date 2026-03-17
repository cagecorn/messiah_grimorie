import Logger from '../../../utils/Logger.js';
import projectileManager from '../ProjectileManager.js';

/**
 * 토네이도 샷 (Tornado Shot)
 * 역할: [직선 관통 탄환을 발사하여 광역 데미지 및 슬로우 부여]
 */
class TornadoShot {
    constructor() {
        this.id = 'tornado_shot';
        this.name = 'Tornado Shot';
        this.cooldown = 10000; 
        this.damageMultiplier = 1.5;
        this.scalingStat = 'atk';
    }

    execute(owner, target) {
        if (!owner || !target) return;
        
        // 타겟 방향으로 멀리 날아가는 좌표 계산 (화면 밖까지 관통 유도)
        const angle = Phaser.Math.Angle.Between(owner.x, owner.y, target.x, target.y);
        const targetPos = {
            x: owner.x + Math.cos(angle) * 1000,
            y: owner.y + Math.sin(angle) * 1000
        };

        projectileManager.fire('tornado_shot', owner, null, {
            targetPos: targetPos,
            damageMultiplier: this.damageMultiplier,
            isPierce: true
        });

        Logger.info("SKILL", `${owner.logic.name} fires Tornado Shot!`);
    }
}

const tornadoShot = new TornadoShot();
export default tornadoShot;
