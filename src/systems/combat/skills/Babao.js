import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import projectileManager from '../ProjectileManager.js';

/**
 * 바오 궁극기: 가라! 바바오! (Babao)
 * 역할: [화면 전체에 거대 바위 우박 낙하]
 */
class Babao {
    constructor() {
        this.id = 'Babao';
        this.name = 'Gara! Babao!';
        this.rockCount = 25; 
        this.mAtkMultiplier = 2.5; 
        this.scalingStat = 'mAtk';
    }

    execute(owner) {
        if (!owner) return;

        Logger.info("ULTIMATE", `[Bao] Gara! Babao! - Telekinetic rock storm!`);

        // 1. 컷씬 연출
        ultimateCutsceneManager.show('bao', 'Gara! Babao!');

        // 2. 게이지 초기화
        owner.ultimateProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;

        // 3. 바위 순차 낙하
        const scene = owner.scene;
        const worldBounds = scene.physics.world.bounds;

        for (let i = 0; i < this.rockCount; i++) {
            scene.time.delayedCall(Phaser.Math.Between(0, 3500), () => {
                this.dropRock(owner, worldBounds);
            });
        }
    }

    /**
     * 랜덤한 위치에 바위 하나 낙하
     */
    dropRock(owner, bounds) {
        const targetX = Phaser.Math.Between(bounds.x, bounds.x + bounds.width);
        const targetY = Phaser.Math.Between(bounds.y, bounds.y + bounds.height);

        projectileManager.fire('rock', owner, null, {
            targetPos: { x: targetX, y: targetY },
            damageMultiplier: this.mAtkMultiplier,
            scale: Phaser.Math.FloatBetween(1.5, 3.0),
            radius: 150,
            isUltimate: true,
            speed: Phaser.Math.Between(1200, 1800) 
        });
    }
}

const babao = new Babao();
export default babao;
