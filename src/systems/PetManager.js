import Logger from '../utils/Logger.js';

/**
 * 펫 매니저 (Pet Manager)
 * 역할: [라우터 & 펫 시스템 제어기]
 */
class PetManager {
    constructor() {
        this.activePets = new Map();
        Logger.system("PetManager: Initialized (Companion hub ready).");
    }

    /**
     * 펫 소환/동행 라우팅
     */
    spawnPet(petId, owner) {
        Logger.info("PET_ROUTER", `Routing pet spawn: ${petId} for ${owner.id}`);
    }

    /**
     * 펫 스킬 발동 라우팅
     */
    triggerPetSkill(petId) {
        Logger.info("PET_ROUTER", `Routing skill trigger for pet: ${petId}`);
    }
}

const petManager = new PetManager();
export default petManager;
