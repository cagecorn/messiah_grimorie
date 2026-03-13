import Logger from '../../utils/Logger.js';

/**
 * 비네팅 매니저 (Vignette Manager)
 */
class VignetteManager {
    constructor() {
        this.element = document.getElementById('fx-vignette');
    }

    setEnabled(enabled) {
        if (!this.element) return;
        this.element.style.display = enabled ? 'block' : 'none';
        Logger.info("FX", `Vignette: ${enabled}`);
    }

    setIntensity(opacity) {
        if (!this.element) return;
        this.element.style.opacity = opacity;
    }
}

export default new VignetteManager();
