import Logger from '../utils/Logger.js';

/**
 * 상점 매니저 (Shop Manager)
 * 역할: [라우터 & 거래 통제관]
 */
class ShopManager {
    constructor() {
        this.activeShops = new Map();
        Logger.system("ShopManager: Initialized (Commerce hub ready).");
    }

    /**
     * 상점 목록 로드 라우팅
     */
    openShop(shopId) {
        Logger.info("SHOP_ROUTER", `Opening shop: ${shopId}`);
    }

    /**
     * 구매 요청 라우팅
     */
    requestPurchase(shopId, itemId, count = 1) {
        Logger.info("SHOP_ROUTER", `Routing purchase request: ${itemId} x${count} from ${shopId}`);
    }
}

const shopManager = new ShopManager();
export default shopManager;
