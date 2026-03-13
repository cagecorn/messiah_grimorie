import Logger from '../../utils/Logger.js';

/**
 * 컬러 그레이딩 매니저 (Color Grading Manager)
 */
class ColorGradingManager {
    constructor() {
        this.element = document.getElementById('fx-color-grading');
    }

    setEnabled(enabled) {
        if (!this.element) return;
        this.element.style.display = enabled ? 'block' : 'none';
        Logger.info("FX", `Color Grading: ${enabled}`);
    }

    setPreset(color, mixMode = 'soft-light') {
        if (!this.element) return;
        this.element.style.backgroundColor = color;
        this.element.style.mixBlendMode = mixMode;
    }
}

export default new ColorGradingManager();
