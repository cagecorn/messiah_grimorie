import Logger from '../../utils/Logger.js';

/**
 * 크로마틱 에버레이션 매니저 (Chromatic Aberration Manager)
 * 역할: [화면 외곽부의 미세한 RGB 색수차 연출]
 */
class ChromaticAberrationManager {
    constructor() {
        this.element = document.getElementById('fx-chromatic');
    }

    setEnabled(enabled) {
        if (!this.element) return;
        this.element.style.display = enabled ? 'block' : 'none';
        Logger.info("FX", `Chromatic Aberration: ${enabled}`);
    }

    setIntensity(v) {
        if (!this.element) return;
        this.element.style.boxShadow = `inset 0 0 ${v * 100}px rgba(255, 0, 0, 0.02), inset 0 0 ${v * 50}px rgba(0, 0, 255, 0.02)`;
    }
}

export default new ChromaticAberrationManager();
