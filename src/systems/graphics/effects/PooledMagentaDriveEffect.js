import Phaser from 'phaser';

/**
 * 마젠타 드라이브 효과 (Pooled Magenta Drive Effect)
 * 역할: [킹의 궁극기 이동 궤적 및 핏방울 파티클 관리]
 */
export default class PooledMagentaDriveEffect {
    constructor(scene) {
        this.scene = scene;
        this.active = false;

        // 붉은 잔상 및 파티클용 컨테이너
        this.container = scene.add.container(0, 0);

        // [NEW] 잔상 스프라이트 추가
        this.sprite = scene.add.sprite(0, 0, 'magenta_drive_effect');
        this.sprite.setAlpha(0.6);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD); // 폭발적인 느낌을 위해 ADD 모드
        this.container.add(this.sprite);

        this.container.setVisible(false);
        this.container.setDepth(200);
    }

    /**
     * 효과 표시
     * @param {number} x 시작 X
     * @param {number} y 시작 Y
     * @param {Object} config { direction, duration }
     */
    show(x, y, config = {}) {
        this.active = true;
        this.container.setPosition(x, y);
        this.container.setVisible(true);

        // 붉은 핏방울 파티클 (Phaser 기본 파티클 활용 - 수량 상향)
        if (this.scene.phaserParticleManager) {
            this.scene.phaserParticleManager.spawnBloodBurst(x, y, 12);
        }

        // 일정 시간 후 자동 반납 (컴포넌트가 직접 관리하거나 외부에서 중단)
        if (config.duration) {
            this.scene.time.delayedCall(config.duration, () => this.hide());
        }
    }

    hide() {
        this.active = false;
        this.container.setVisible(false);
    }

    isFree() {
        return !this.active;
    }
}
