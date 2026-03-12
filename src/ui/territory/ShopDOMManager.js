import Logger from '../../utils/Logger.js';

/**
 * 상점 DOM 매니저 (Shop DOM Manager)
 */
class ShopDOMManager {
    constructor() {
        this.ui_activeShopId = null;
        Logger.system("ShopDOMManager: Initialized.");
    }

    ui_openShop(shopId) {
        this.ui_activeShopId = shopId;
        Logger.info("UI_ROUTER", `Opening Shop UI: ${shopId}`);
    }

    ui_updateItemList(items) {
        Logger.info("UI_ROUTER", "Updating shop item displays.");
    }
}

const shopDOMManager = new ShopDOMManager();
export default shopDOMManager;
