import Logger from '../../utils/Logger.js';
import BaseEntity from '../../entities/BaseEntity.js';

/**
 * 펫 매니저 (Pet Manager)
 * 역할: [플레이어를 따라다니는 펫 관리]
 */
class PetManager {
    constructor() {
        this.pets = new Map();
    }

    registerPet(config) {
        const pet = new BaseEntity({
            ...config,
            type: 'pet'
        });
        this.pets.set(pet.id, pet);
        return pet;
    }
}

const petManager = new PetManager();
export default petManager;
