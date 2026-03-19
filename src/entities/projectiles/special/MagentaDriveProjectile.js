import Phaser from 'phaser';
import combatManager from '../../../systems/CombatManager.js';
import fxManager from '../../../systems/graphics/FXManager.js';
import measurementManager from '../../../core/MeasurementManager.js';

/**
 * 마젠타 드라이브 투사체 (Magenta Drive Projectile)
 * 역할: [킹 본인이 탑승하여 화면을 가로지르는 광역 관통형 투사체]
 */
export default class MagentaDriveProjectile extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);
        
        this.owner = null;
        this.active = false;
        this.speed = 1200; // 매우 빠른 속도
        this.direction = 1; // 1: Right, -1: Left
        this.hitTargets = new Set();
        this.damageMultiplier = 3.0; // 궁극기 기본 배율

        // 사선/호 수정을 위한 컨테이너 셋업
        this.setSize(100, 40);
        scene.physics.add.existing(this);
        if (this.body) {
            this.body.setAllowGravity(false);
            this.body.setImmovable(true);
        }
    }

    /**
     * 투사체 발사 (킹 탑승)
     */
    launch(owner, config = {}) {
        this.owner = owner;
        this.active = true;
        this.hitTargets.clear();
        this.damageMultiplier = config.multiplier || 3.0;

        // 시작 위치 및 방향 설정 (화면 끝에서 끝으로)
        const world = measurementManager.world;
        const screenX = this.scene.cameras.main.scrollX;
        const screenWidth = this.scene.cameras.main.width;

        this.direction = owner.flipX ? -1 : 1;
        
        // 시전 시 킹을 투사체에 탑승시킴
        owner.setVisible(false);
        if (owner.body) owner.body.setEnable(false);
        owner.isBeingCarried = true;

        this.setPosition(owner.x, owner.y);
        
        // 이동 시작
        if (this.body) {
            this.body.setVelocityX(this.speed * this.direction);
        }

        // 붉은 궤적 재생 시작
        if (this.scene.animationManager) {
            this.scene.animationManager.playMagentaDriveEffect(this.x, this.y, { duration: 1500 });
        }

        // 화면 밖으로 나가면 자동 소멸 (약간 여유 있게)
        this.scene.time.delayedCall(2000, () => {
            if (this.active) this.finish();
        });
    }

    update(time, delta) {
        if (!this.active) return;

        // 실시간 위치 동기화 (킹을 투사체 위치로 이동)
        if (this.owner) {
            this.owner.setPosition(this.x, this.y);
        }

        // 충돌 검사 (격자 시스템 활용)
        const range = 80;
        const targets = combatManager.getUnitsInRange(this.x, this.y, range);
        
        targets.forEach(target => {
            if (target.active && target.team !== this.owner.team && !this.hitTargets.has(target.id)) {
                this.hitTargets.add(target.id);
                combatManager.processDamage(this.owner, target, this.damageMultiplier, 'physical', true);
            }
        });
    }

    finish() {
        if (!this.active) return;
        this.active = false;

        if (this.owner) {
            this.owner.setVisible(true);
            if (this.owner.body) this.owner.body.setEnable(true);
            this.owner.isBeingCarried = false;

            // [핵심] 컨테이너에서 내릴 때 '블러드 레이지' 즉시 발동
            this.triggerBloodRage();
        }

        if (this.body) this.body.setVelocity(0, 0);
        this.destroy();
    }

    triggerBloodRage() {
        // 지연 로딩 방지를 위해 import 문 활용 가능
        import('../../../systems/combat/skills/BloodRage.js').then(m => {
            const bloodRage = new m.default();
            bloodRage.execute(this.owner);
        });
    }
}
