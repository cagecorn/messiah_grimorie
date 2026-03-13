import Logger from '../../utils/Logger.js';

/**
 * 궤적 매니저 (Trail Manager - Particle Trails)
 */
class TrailManager {
    constructor() {
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
    }

    /**
     * 특정 소스(탄환 등)에 궤적 입히기
     */
    addTrail(target, color = 0xffffff) {
        if (!this.scene) return null;

        const emitter = this.scene.add.particles(0, 0, 'dummy_0', {
            follow: target,
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 300,
            blendMode: 'ADD',
            tint: color
        });

        return emitter;
    }
}

export default new TrailManager();
