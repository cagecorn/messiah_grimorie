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
     * [신규] "운명의 끈" 전용 매우 촘촘한 실 형태의 궤적
     */
    createThreadTrail(target) {
        if (!this.scene) return null;

        // [USER 요청] 물방울처럼 끊기지 않고 '빛나는 직선'처럼 보이도록 개선
        const emitter = this.scene.add.particles(0, 0, 'particle_thread', {
            follow: target,
            scale: { start: 1.0, end: 0.8 }, // 끈의 굵기 유지
            alpha: { start: 1.0, end: 0 }, 
            lifespan: 1000,                  // 끈이 화면에 선명하게 남는 시간
            blendMode: 'ADD',
            color: [0xff0000, 0xff3300, 0xff0000], 
            frequency: 1,                    // 1ms 마다 하나씩
            quantity: 2,                     // [핵심] 1ms 당 2개씩 생성하여 빈틈을 완전히 메움
            maxParticles: 2000,
            emitting: true
        });

        emitter.setDepth(target.depth + 15); // 투사체보다도 위에
        return emitter;
    }
    
    /**
     * 에미터 중지 및 제거
     */
    stopTrail(emitter) {
        if (!emitter) return;
        emitter.stop();
        // 파티클들이 자연스럽게 사라진 후 완전 제거
        this.scene.time.delayedCall(500, () => {
            if (emitter) emitter.destroy();
        });
    }
}

const trailManager = new TrailManager();
export default trailManager;
