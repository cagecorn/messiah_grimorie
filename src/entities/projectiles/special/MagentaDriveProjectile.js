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
        this.speed = 8000; // [REFINE] 순간적인 이동을 위해 속도 대폭 상향 (기존 1200)
        this.direction = 1; // 1: Right, -1: Left
        this.hitTargets = new Set();
        this.damageMultiplier = 3.0; // 궁극기 기본 배율

        // 사선/호 수정을 위한 컨테이너 셋업
        this.setSize(100, 40);

        // [NEW] 킹이 탑승할 투사체 비주얼 추가
        this.projectileSprite = scene.add.sprite(0, 0, 'magenta_drive_effect');
        this.projectileSprite.setOrigin(0.5, 0.5);
        this.projectileSprite.setScale(12, 0.6); // [REFINE] 화면을 가로로 길게 가르는 느낌 (기존 1.5)
        this.projectileSprite.setAlpha(0.9);
        this.projectileSprite.setBlendMode(Phaser.BlendModes.ADD);
        this.add(this.projectileSprite);

        scene.physics.add.existing(this);
        if (this.body) {
            this.body.setAllowGravity(false);
            this.body.setImmovable(true);
        }
    }

    /**
     * 투사체 발사 (킹 탑승 및 화면 횡단 개조)
     */
    launch(owner, target, config = {}) {
        this.owner = owner;
        this.active = true;
        this.hitTargets.clear();

        const safeConfig = config || {};
        this.damageMultiplier = safeConfig.multiplier || 3.0;

        // [REDESIGN] 카메라 월드 뷰를 기준으로 시작/종료 지점 계산
        const camera = this.scene.cameras.main;
        const worldView = camera.worldView;
        const margin = 100; // 화면 밖 여유 공간

        this.direction = owner.flipX ? -1 : 1;

        // 방향에 따라 화면 왼쪽 끝 또는 오른쪽 끝에서 시작
        const startX = (this.direction === 1) ? worldView.x - margin : worldView.right + margin;

        // 방향에 맞춰 스프라이트 반전
        this.projectileSprite.setFlipX(this.direction === -1);

        // 시전 시 킹을 투사체에 탑승시킴 (순간이동 연출)
        owner.setVisible(false);
        if (owner.body) owner.body.setEnable(false);
        owner.isBeingCarried = true;

        // 시작 좌표로 즉시 이동
        this.setPosition(startX, owner.y);
        owner.setPosition(startX, owner.y);

        // 이동 시작
        if (this.body) {
            this.body.setVelocityX(this.speed * this.direction);
        }

        // 시전 시 강렬한 화면 플래시 및 흔들림 연출
        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.flash(150, 255, 255, 255);
            this.scene.cameras.main.shake(150, 0.012);
        }

        // 붉은 궤적 재생 시작
        if (this.scene.animationManager) {
            this.scene.animationManager.playMagentaDriveEffect(this.x, this.y, { duration: 400 });
        }

        // 화면 횡단 완료 시점 (속도 8000 기준 약 0.3~0.4초)
        const travelTime = (worldView.width + margin * 2) / (this.speed / 1000); // ms로 환산
        this.scene.time.delayedCall(Math.min(travelTime, 500), () => {
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
                // [REFINE] 타격 시 더 많은 핏자국 연출
                if (this.scene.phaserParticleManager) {
                    this.scene.phaserParticleManager.spawnBloodBurst(target.x, target.y, 8);
                }
                combatManager.processDamage(this.owner, target, this.damageMultiplier, 'physical', true);
            }
        });
    }

    finish() {
        if (!this.active) return;
        this.active = false;

        if (this.owner) {
            // [REDESIGN] 사출 시 킹의 최종 위치 확정
            this.owner.setPosition(this.x, this.y);
            this.owner.setVisible(true);
            if (this.owner.body) {
                this.owner.body.setEnable(true);
                this.owner.body.setVelocity(0, 0); // 사출 후 정지
            }
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
