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
        
        // [텍스처] 글로우(Glow) 효과용 부드러운 원형 파티클 (강력한 발산형으로 개선)
        const glowGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
        for (let i = 16; i > 0; i--) {
            // 안쪽으로 갈수록 급격하게 불투명하게 (Punchy Center)
            const alpha = Math.pow((17 - i) / 16, 4) * 0.9;
            glowGraphics.fillStyle(0xffffff, alpha);
            glowGraphics.fillCircle(16, 16, i);
        }
        glowGraphics.generateTexture('particle_glow', 32, 32);
        
        // [신규] 끈(Thread) 형태용 고밀도 파티클: 코어는 단단하고 외곽은 얇은 광채
        const threadGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
        threadGraphics.fillStyle(0xffffff, 1);
        threadGraphics.fillCircle(8, 8, 4); // 뚜렷한 실의 심심
        threadGraphics.fillStyle(0xffffff, 0.4);
        threadGraphics.fillCircle(8, 8, 10); // 얇은 광배
        threadGraphics.generateTexture('particle_thread', 16, 16);

        this.createBloodPool();
        this.createDustPool();
        this.createSoulPool();
        Logger.system("PhaserParticleManager: Particle systems initialized with Glow texture.");
    }

    /**
     * 핏방울 파티클 풀 생성 (Phaser 내장 풀링 활용)
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
            quantity: 15, // [상향] 더 많은 핏방울
            maxParticles: 1000, // [풀링] 최대 입자 수 제한으로 과부하 방지
            emitting: false
        });

        this.emitters.set('blood', emitter);
    }

    /**
     * 먼지 파티클 풀 생성
     */
    createDustPool() {
        if (!this.scene) return;

        const emitter = this.scene.add.particles(0, 0, 'particle_blood', {
            color: [ 0xffffff, 0xeeeeee, 0xcccccc ], // 흰색 ~ 밝은 회색
            speed: { min: 100, max: 400 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 600,
            blendMode: 'NORMAL',
            gravityY: 200,
            quantity: 20,
            maxParticles: 500, // [풀링]
            emitting: false
        });

        this.emitters.set('white_dust', emitter);
    }

    /**
     * 영혼(Soul) 파티클 풀 생성: 사망 시 승천하는 효과
     */
    createSoulPool() {
        if (!this.scene) return;

        const emitter = this.scene.add.particles(0, 0, 'particle_blood', {
            color: [ 0xffffff, 0x00ffff, 0xaaaaff ], // 흰색 ~ 하늘색
            speedY: { min: -50, max: -150 }, // 위로 상승
            speedX: { min: -20, max: 20 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 1.0, end: 0 },
            lifespan: 1500,
            blendMode: 'ADD',
            quantity: 10, // [상향]
            maxParticles: 300, // [풀링]
            emitting: false
        });

        this.emitters.set('soul', emitter);
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

    /**
     * 특정 위치에서 먼지 폭발 효과 발생
     */
    spawnWhiteDust(x, y) {
        const emitter = this.emitters.get('white_dust');
        if (!emitter) return;

        emitter.explode(20, x, y);
    }

    /**
     * 사망 시 영혼 승천 효과 발생
     */
    spawnSoul(x, y) {
        const emitter = this.emitters.get('soul');
        if (!emitter) return;

        emitter.explode(8, x, y);
    }
}

const phaserParticleManager = new PhaserParticleManager();
export default phaserParticleManager;
