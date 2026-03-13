import Logger from '../../utils/Logger.js';

/**
 * 블러 매니저 (Blur Manager)
 * 역할: [화면 전체에 몽환적인 블러 효과 적용]
 */
class BlurManager {
    constructor() {
        this.element = document.getElementById('fx-blur');
    }

    setEnabled(enabled) {
        if (!this.element) return;
        this.element.style.display = enabled ? 'block' : 'none';
        Logger.info("FX", `Dreamy Blur: ${enabled}`);
    }

    /**
     * 블러 강도 조절 (픽셀 단위)
     * @param {number} radius 
     */
    setBlur(radius) {
        if (!this.element) return;
        this.element.style.backdropFilter = `blur(${radius}px)`;
        Logger.info("FX", `Blur radius set to: ${radius}px`);
    }
}

export default new BlurManager();
