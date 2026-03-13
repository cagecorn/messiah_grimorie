import Logger from '../../utils/Logger.js';

/**
 * 블룸 매니저 (Bloom Manager - Phaser FX)
 */
class BloomManager {
    constructor() {
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
        Logger.info("PHASER_FX", "Bloom system initialized (Inactive).");
    }

    /**
     * 특정 객체에 블룸 적용 (현재 비활성화)
     */
    applyTo(target, options = {}) {
        // 유저 요청에 의해 비활성화됨
        return null;
    }
}

export default new BloomManager();
