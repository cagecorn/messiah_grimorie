import Logger from '../../utils/Logger.js';

/**
 * 궤적 매니저 (Trail Manager)
 * 역할: [투사체 및 이동 객체의 화려한 잔상/궤적 연출]
 * 
 * 특징:
 * 1. Glowing Trail: PhaserParticleManager의 glow 텍스처를 이용한 빛발 연출
 * 2. Follow Support: 특정 포인트나 객체를 따라다니는 에미터 관리
 */
class TrailManager {
    constructor() {
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
        Logger.system("TrailManager: Projectile trajectory system ready.");
    }

    /**
     * 붉은 빛의 강력한 넉백 샷 궤적 생성
     */
    createKnockbackTrail(target) {
        if (!this.scene) return null;

        // [USER 요청] 빛나는(Glow) 효과 + 더 강렬한 붉은 잔상
        const emitter = this.scene.add.particles(0, 0, 'particle_glow', {
            follow: target,
            scale: { start: 0.6, end: 0.2 }, // [상향] 크기를 2배로 증가
            alpha: { start: 1.0, end: 0 },   // [상향] 최대 불투명도
            lifespan: 400,                   // [상향] 잔상이 조금 더 길게 남음
            blendMode: 'ADD',
            color: [0xff0000, 0xff5555, 0xff8888], // [조정] 더 밝고 선명한 빨강
            frequency: 4, // [최적화] 훨씬 더 촘촘하게 (4ms 마다 하나씩 생성 - 거의 선으로 보임)
            maxParticles: 300,
            emitting: true
        });

        // 궤적은 투사체의 일부처럼 보여야 하므로 깊이 조절 (엔티티보다 확실히 위)
        emitter.setDepth(target.depth + 10);

        return emitter;
    }

    /**
     * 일반적인 정기 광채 궤적 (다른 스킬용)
     */
    createGenericTrail(target, color = 0xffffff) {
        if (!this.scene) return null;

        const emitter = this.scene.add.particles(0, 0, 'particle_glow', {
            follow: target,
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 400,
            blendMode: 'ADD',
            color: color,
            frequency: 20,
            maxParticles: 50,
            emitting: true
        });

        emitter.setDepth(target.depth - 0.1);
        return emitter;
    }

    /**
     * [신규] "운명의 끈" 전용 직선 실 형태의 궤적
     */
    createThreadTrail(target) {
        if (!this.scene) return null;

        // [USER 요청] 파티클 대신 '붉은 색 직선'으로 구현
        const trail = new ThreadTrail(this.scene, target);
        return trail;
    }
    
    /**
     * 에미터 또는 커스텀 궤적 중지 및 제거
     */
    stopTrail(trail) {
        if (!trail) return;
        
        if (trail.stop && typeof trail.stop === 'function') {
            trail.stop();
        } else if (trail.stop && typeof trail.stop === 'object') {
            // Emitter 인 경우
            trail.stop();
            this.scene.time.delayedCall(500, () => {
                if (trail) trail.destroy();
            });
        }
    }
}

/**
 * 운명의 끈 전용 직선 궤적 클래스
 */
class ThreadTrail {
    constructor(scene, target) {
        this.scene = scene;
        this.target = target;
        this.startPos = { x: target.x, y: target.y };
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(810); // 프로젝트일 fx(800) 보다 위
        this.color = 0xff0000;
        this.alpha = 1.0;
        this.isStopped = false;
        
        // ADD 모드 효과를 위해 블렌드 모드 설정
        this.graphics.setBlendMode(Phaser.BlendModes.ADD);
    }

    /**
     * 매 프레임 업데이트 (투사체에서 호출 필수)
     */
    update() {
        if (this.isStopped || !this.graphics) return;

        this.graphics.clear();
        
        // 메인 끈 (진한 빨강)
        this.graphics.lineStyle(2, 0xff0000, this.alpha);
        this.graphics.beginPath();
        this.graphics.moveTo(this.startPos.x, this.startPos.y);
        this.graphics.lineTo(this.target.x, this.target.y);
        this.graphics.strokePath();

        // 중앙 빛나는 선 (밝은 빨강/흰색)
        this.graphics.lineStyle(1, 0xff8888, this.alpha * 0.8);
        this.graphics.beginPath();
        this.graphics.moveTo(this.startPos.x, this.startPos.y);
        this.graphics.lineTo(this.target.x, this.target.y);
        this.graphics.strokePath();
    }

    stop() {
        this.isStopped = true;
        if (!this.scene) return;

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 800,
            onUpdate: () => {
                if (this.graphics) {
                    this.update();
                }
            },
            onComplete: () => {
                if (this.graphics) {
                    this.graphics.destroy();
                    this.graphics = null;
                }
            }
        });
    }
}

const trailManager = new TrailManager();
export default trailManager;
