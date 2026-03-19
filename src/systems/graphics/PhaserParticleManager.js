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
        this.createHealPool();
        this.createMagicFlashPool();
        this.createPurpleMagicPool();
        this.createExplosionPool();
        this.createRedMagicPool();
        this.createSleepPool();
        this.createBlueMagicPool();
        Logger.system("PhaserParticleManager: Particle systems initialized with Glow, Thread, Heal, and Sleep textures.");
    }

    /**
     * 수면(Sleep) 파티클 풀 생성: "Z" 혹은 "ZZZ" 글자 파티클
     */
    createSleepPool() {
        if (!this.scene) return;

        // [텍스처 생성] "Z" 글자 텍스처
        const text = this.scene.make.text({ 
            text: 'Z', 
            style: { font: '24px Arial', fill: '#ffffff', stroke: '#000000', strokeThickness: 2 },
            add: false 
        });
        text.updateText(); // 캔버스 업데이트 강제
        this.scene.textures.addCanvas('particle_z', text.canvas);

        const emitter = this.scene.add.particles(0, 0, 'particle_z', {
            color: [ 0xffffff, 0xaaaaff ], 
            speedY: { min: -40, max: -80 }, // 천천히 상승
            speedX: { min: -10, max: 20 },
            scale: { start: 0.5, end: 1.2 },
            alpha: { start: 1.0, end: 0 },
            lifespan: 2000,
            blendMode: 'NORMAL',
            rotate: { min: -20, max: 20 },
            frequency: 500, // 일정한 간격으로 발생
            emitting: false
        });

        this.emitters.set('sleep', emitter);
    }

    /**
     * 힐 파티클 풀 생성
     */
    createHealPool() {
        if (!this.scene) return;

        const emitter = this.scene.add.particles(0, 0, 'particle_glow', {
            color: [ 0x00ff00, 0x55ff55, 0xaaffaa ], // 연두 ~ 밝은 초록
            speed: { min: 40, max: 120 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 800,
            blendMode: 'ADD',
            gravityY: -100, // 위로 살짝 떠오름
            quantity: 10,
            maxParticles: 500,
            emitting: false
        });

        this.emitters.set('heal', emitter);
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
        
        // [FIX] 파티클이 엔티티 뒤로 숨지 않도록 레이어 설정
        if (this.scene.sys.game.layerManager) {
            emitter.setDepth(this.scene.sys.game.layerManager.getDepth('fx'));
        }
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
     * 마법 섬광(Magic Flash) 파티클 풀 생성: 적중 시 노란색 불꽃 퍼짐
     */
    createMagicFlashPool() {
        if (!this.scene) return;

        const emitter = this.scene.add.particles(0, 0, 'particle_glow', {
            color: [ 0xffff00, 0xffaa00, 0xff8800 ], // 노랑 ~ 주황
            speed: { min: 100, max: 300 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 1.0, end: 0 },
            lifespan: 400,
            blendMode: 'ADD',
            quantity: 15,
            maxParticles: 500,
            emitting: false
        });

        this.emitters.set('magic_flash', emitter);
    }

    /**
     * 보라색 마법 파티클 풀 생성 (위자드 평타용)
     */
    createPurpleMagicPool() {
        if (!this.scene) return;

        const emitter = this.scene.add.particles(0, 0, 'particle_glow', {
            color: [ 0xaa00ff, 0xdd00ff, 0xffffff ], 
            speed: { min: 80, max: 200 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1.0, end: 0 },
            lifespan: 400,
            blendMode: 'ADD',
            quantity: 10,
            maxParticles: 500,
            emitting: false
        });

        this.emitters.set('purple_magic', emitter);
    }

    /**
     * 폭발(Explosion) 파티클 풀 생성 (메테오 히트용)
     */
    createExplosionPool() {
        if (!this.scene) return;

        const emitter = this.scene.add.particles(0, 0, 'particle_glow', {
            color: [ 0xff4400, 0xff0000, 0xffff00 ], // 빨강 ~ 주황 ~ 노랑
            speed: { min: 150, max: 400 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1.0, end: 0 },
            lifespan: 800,
            blendMode: 'ADD',
            quantity: 30,
            maxParticles: 1000,
            emitting: false
        });

        emitter.setDepth(this.scene.sys.game.layerManager ? this.scene.sys.game.layerManager.getDepth('fx') : 800);
        this.emitters.set('explosion', emitter);
    }

    /**
     * 빨간색 마법 흔적(Trail) 풀
     */
    createRedMagicPool() {
        if (!this.scene) return;

        const emitter = this.scene.add.particles(0, 0, 'particle_glow', {
            color: [ 0xff0000, 0xff8800, 0xffff00 ],
            speed: { min: 40, max: 120 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 600,
            blendMode: 'ADD',
            quantity: 5,
            maxParticles: 1000,
            emitting: false
        });

        emitter.setDepth(this.scene.sys.game.layerManager ? this.scene.sys.game.layerManager.getDepth('fx') : 800);
        this.emitters.set('red_magic', emitter);
    }

    /**
     * 파란색 마법 파티클 풀 생성 (얼음 계열)
     */
    createBlueMagicPool() {
        if (!this.scene) return;

        const emitter = this.scene.add.particles(0, 0, 'particle_glow', {
            color: [ 0x00ccff, 0x00ffff, 0xffffff ], 
            speed: { min: 80, max: 250 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 1.0, end: 0 },
            lifespan: 600,
            blendMode: 'ADD',
            quantity: 15,
            maxParticles: 500,
            emitting: false
        });

        this.emitters.set('blue_magic', emitter);
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
     * [신규] 지면 충돌 먼지 효과 (Impact Dust)
     */
    spawnImpactDust(x, y) {
        this.spawnWhiteDust(x, y);
    }

    /**
     * 사망 시 영혼 승천 효과 발생
     */
    spawnSoul(x, y) {
        const emitter = this.emitters.get('soul');
        if (!emitter) return;

        emitter.explode(8, x, y);
    }

    /**
     * 힐 효과 파티클 발생
     */
    spawnHealBurst(x, y) {
        const emitter = this.emitters.get('heal');
        if (!emitter) return;

        emitter.explode(12, x, y);
    }

    /**
     * 특정 위치에서 마법 섬광 연출
     */
    spawnMagicFlash(x, y) {
        const emitter = this.emitters.get('magic_flash');
        if (!emitter) return;

        emitter.explode(15, x, y);
    }

    /**
     * 보라색 파티클 폭발 연출
     */
    spawnPurpleMagic(x, y) {
        const emitter = this.emitters.get('purple_magic');
        if (!emitter) return;

        emitter.explode(12, x, y);
    }

    /**
     * 메테오 폭발 연출
     */
    spawnExplosion(x, y) {
        const emitter = this.emitters.get('explosion');
        if (!emitter) return;

        emitter.explode(30, x, y);
    }

    /**
     * 빨간색 마법 파티클 한 점 생성
     */
    spawnRedMagic(x, y, count = 5) {
        const emitter = this.emitters.get('red_magic');
        if (!emitter) return;

        emitter.explode(count, x, y);
    }

    /**
     * 수면 상태 시 지속적으로 Z 파티클 발생
     */
    startSleepEffect(x, y, duration) {
        const emitter = this.emitters.get('sleep');
        if (!emitter) return;

        emitter.setPosition(x, y);
        emitter.start();

        this.scene.time.delayedCall(duration, () => {
            emitter.stop();
        });
    }

    /**
     * 파란색 파티클 폭발 연출 (얼음)
     */
    spawnBlueMagic(x, y, count = 12) {
        const emitter = this.emitters.get('blue_magic');
        if (!emitter) return;

        emitter.explode(count, x, y);
    }
}

const phaserParticleManager = new PhaserParticleManager();
export default phaserParticleManager;
