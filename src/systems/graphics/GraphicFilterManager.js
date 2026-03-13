import Logger from '../../utils/Logger.js';

/**
 * 그래픽 필터 매니저 (Graphic Filter Manager - Scanlines)
 */
class GraphicFilterManager {
    constructor() {
        this.element = document.getElementById('fx-scanlines');
    }

    setEnabled(enabled) {
        if (!this.element) return;
        this.element.style.display = enabled ? 'block' : 'none';
        Logger.info("FX", `Scanlines: ${enabled}`);
    }
}

export default new GraphicFilterManager();
