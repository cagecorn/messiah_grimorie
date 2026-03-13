import Logger from '../../utils/Logger.js';

/**
 * 그래픽 텍스처 매니저 (Graphic Texture Manager - Film Grain)
 */
class GraphicTextureManager {
    constructor() {
        this.element = document.getElementById('fx-film-grain');
    }

    setEnabled(enabled) {
        if (!this.element) return;
        this.element.style.display = enabled ? 'block' : 'none';
        Logger.info("FX", `Film Grain: ${enabled}`);
    }
}

export default new GraphicTextureManager();
