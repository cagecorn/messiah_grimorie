import Logger from '../utils/Logger.js';
import audioManager from '../core/AudioManager.js';

/**
 * 사운드 매니저 (Sound Manager)
 * 역할: [전문화된 효과음 재생 컨트롤러]
 */
class SoundManager {
    constructor() {
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
        Logger.system("SoundManager: Hit SFX randomization system ready.");
    }

    /**
     * 물리 타격 효과음 랜덤 재생
     */
    playPhysicalHit() {
        if (!this.scene) return;

        // 1, 2, 3 중 랜덤 선택
        const randomIndex = Math.floor(Math.random() * 3) + 1;
        const key = `hit_phys_${randomIndex}`;

        // AudioManager를 통해 재생
        audioManager.playSFX(this.scene, key, 0.6); // 0.6 볼륨으로 너무 크지 않게
    }
}

const soundManager = new SoundManager();
export default soundManager;
