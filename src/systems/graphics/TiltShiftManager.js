import Logger from '../../utils/Logger.js';

/**
 * 틸트 쉬프트 매니저 (Tilt-Shift Manager)
 */
class TiltShiftManager {
    constructor() {
        this.element = document.getElementById('fx-tilt-shift');
    }

    setEnabled(enabled) {
        if (!this.element) return;
        this.element.style.display = enabled ? 'block' : 'none';
        Logger.info("FX", `Tilt-Shift: ${enabled}`);
    }

    setBlur(amount) {
        if (!this.element) return;
        this.element.style.backdropFilter = `blur(${amount}px)`;
    }
}

export default new TiltShiftManager();
