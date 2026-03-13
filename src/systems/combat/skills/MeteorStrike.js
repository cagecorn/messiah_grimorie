import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import projectileManager from '../ProjectileManager.js';
import soundManager from '../../SoundManager.js';

/**
 * 멀린 궁극기: 메테오 스트라이크 (Meteor Strike)
 * 역할: [전장에 30개의 운석 무작위 낙하 + 전체 초토화]
 */
class MeteorStrike {
    constructor() {
        this.id = 'MeteorStrike';
        this.name = 'Meteor Strike';
        this.meteorCount = 40; // 30개에서 40개로 증량 (더 화끈하게)
        this.mAtkMultiplier = 3.0; 
    }

    execute(owner) {
        if (!owner) return;

        Logger.info("ULTIMATE", `[Merlin] METEOR STRIKE! - Total 40 Meteors raining.`);

        // 1. 컷씬 연출
        ultimateCutsceneManager.show('merlin', 'Meteor Strike!');

        // 2. 게이지 초기화
        owner.ultimateProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;

        // 3. 40개 운석 순차 낙하
        const scene = owner.scene;
        const worldBounds = scene.physics.world.bounds;

        for (let i = 0; i < this.meteorCount; i++) {
            // 무작위 딜레이 (0~4초 사이 분산)
            scene.time.delayedCall(Phaser.Math.Between(0, 4000), () => {
                this.dropMeteor(owner, worldBounds);
            });
        }
    }

    /**
     * 랜덤한 위치에 운석 하나 낙하
     */
    dropMeteor(owner, bounds) {
        // 맵 전체 랜덤 좌표 (지면 기준, 마진 최소화)
        const targetX = Phaser.Math.Between(bounds.x, bounds.x + bounds.width);
        const targetY = Phaser.Math.Between(bounds.y, bounds.y + bounds.height);

        projectileManager.fire('meteor', owner, null, {
            targetPos: { x: targetX, y: targetY },
            damageMultiplier: this.mAtkMultiplier,
            scale: Phaser.Math.FloatBetween(1.2, 2.0), // 크기도 다양하게
            radius: 130,
            isUltimate: true,
            speed: Phaser.Math.Between(1300, 2200) // 속도 다양성 (격차 강조)
        });
    }
}

const meteorStrike = new MeteorStrike();
export default meteorStrike;
