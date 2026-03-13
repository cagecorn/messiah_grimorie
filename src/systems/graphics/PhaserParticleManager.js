import Logger from '../../utils/Logger.js';

/**
 * 페이저 파티클 매니저 (Phaser Particle Manager)
 * 역할: [핏방울 등 파티클 효과의 효율적 생성 및 풀링]
 */
class PhaserParticleManager {
    constructor() {
        this.scene = null;
        this.emitters = new Map();
    }

    init(scene) {
        this.scene = scene;
        
        // [텍스처] 핏방울용 작은 화이트 서클 생성 (틴트로 색상 조절)
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle_blood', 8, 8);
        
        this.createBloodPool();
        Logger.system("PhaserParticleManager: Blood particle system initialized.");
    }

    /**
     * 핏방울 파티클 풀 생성
     */
    createBloodPool() {
        if (!this.scene) return;

        // [Phaser 3.60+] 파티클 이미터 설정
        const emitter = this.scene.add.particles(0, 0, 'particle_blood', {
            color: [ 0xff0000, 0x990000, 0x660000 ], // 진한 빨강 ~ 검붉은 색
            speed: { min: 50, max: 200 },
            scale: { start: 0.6, end: 0 },
            lifespan: 400,
            blendMode: 'NORMAL',
            gravityY: 400,
            quantity: 10,
            emitting: false
        });

        this.emitters.set('blood', emitter);
    }

    /**
     * 특정 위치에서 핏방울 폭발 효과 발생
     */
    spawnBloodBurst(x, y) {
        const emitter = this.emitters.get('blood');
        if (!emitter) return;

        // 특정 좌표에서 한 번(explode) 뿌림
        emitter.explode(10, x, y);
    }
}

const phaserParticleManager = new PhaserParticleManager();
export default phaserParticleManager;
