import Logger from '../../utils/Logger.js';

/**
 * 모츠 매니저 (Motes Manager - Floating Particles)
 */
class MotesManager {
    constructor() {
        this.scene = null;
        this.emitters = [];
    }

    init(scene) {
        this.scene = scene;
        this.createAmbientMotes();
    }

    createAmbientMotes() {
        // [3층 레이어] Parallax 효과를 위한 파티클 생성
        // 배경(0.2x), 중경(0.5x), 전경(1.0x) 속도로 이동하는 빛가루들

        const layers = [
            { count: 20, speed: 10, scale: 0.2, alpha: 0.3, scroll: 0.2 },
            { count: 15, speed: 20, scale: 0.4, alpha: 0.5, scroll: 0.5 },
            { count: 10, speed: 40, scale: 0.6, alpha: 0.7, scroll: 1.0 }
        ];

        layers.forEach((cfg, idx) => {
            const particles = this.scene.add.particles(0, 0, 'dummy_0', { // 'mote' 텍스처 필요하나 우선 더미 사용
                x: { min: 0, max: this.scene.cameras.main.width },
                y: { min: 0, max: this.scene.cameras.main.height },
                lifespan: 10000,
                speedX: { min: -cfg.speed, max: cfg.speed },
                speedY: { min: -cfg.speed, max: cfg.speed },
                scale: cfg.scale,
                alpha: { start: 0, end: cfg.alpha, steps: 100 },
                quantity: 1,
                frequency: 2000,
                blendMode: 'ADD'
            });
            particles.setScrollFactor(cfg.scroll);
            particles.setDepth(-10 + idx);
            this.emitters.push(particles);
        });

        Logger.info("PHASER_FX", "3-Layer Ambient Motes initialized.");
    }
}

export default new MotesManager();
