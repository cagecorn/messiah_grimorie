import Logger from '../utils/Logger.js';

/**
 * 요리 매니저 (Cooking Manager)
 * 역할: [라우터 & 요리 시스템 제어기]
 */
class CookingManager {
    constructor() {
        Logger.system("CookingManager: Initialized (Culinary hub ready).");
    }

    /**
     * 요리 실행 요청 라우팅
     */
    requestCook(recipeId, ingredients) {
        Logger.info("COOKING_ROUTER", `Routing cook request for recipe: ${recipeId}`);
    }

    /**
     * 요리 버프 적용 라우팅
     */
    applyDishEffect(dishId) {
        Logger.info("COOKING_ROUTER", `Routing effect application for dish: ${dishId}`);
    }
}

const cookingManager = new CookingManager();
export default cookingManager;
