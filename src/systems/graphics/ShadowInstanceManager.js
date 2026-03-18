import Logger from '../../utils/Logger.js';

/**
 * 그림자 인스턴스 매니저 (Shadow Instance Manager)
 * 역할: [모든 그림자 객체에 고유 인스턴스 ID 부여 및 관리]
 * 
 * 설명: 던전 내 생성되는 모든 그림자(유닛, 투사체 등)에 unique ID를 할당하고
 * 특정 ID를 가진 그림자를 추적하거나 관리할 수 있는 기능을 제공합니다.
 */
class ShadowInstanceManager {
    constructor() {
        this.instances = new Map(); // instanceId -> shadowData
        this.nextId = 1;
    }

    /**
     * 그림자 인스턴스 등록
     * @param {CombatEntity|Projectile} owner 그림자의 주인
     * @param {object} shadowData 그림자 관련 데이터 (그래픽 객체 등)
     * @returns {string} 생성된 인스턴스 ID
     */
    register(owner, shadowData) {
        const instanceId = `shadow_${this.nextId++}`;
        
        const entry = {
            instanceId,
            owner,
            shadowData,
            createdAt: Date.now()
        };

        this.instances.set(instanceId, entry);
        
        // 주인(Owner)에게도 인스턴스 ID 부여 (추적 용이성)
        if (owner) {
            owner.shadowInstanceId = instanceId;
        }

        Logger.debug("SHADOW_INSTANCE", `Registered instance [${instanceId}] for [${owner ? (owner.logic?.name || owner.id) : 'unknown'}]`);
        return instanceId;
    }

    /**
     * 그림자 인스턴스 해제
     * @param {string|object} idOrOwner instanceId 또는 owner 객체
     */
    unregister(idOrOwner) {
        let instanceId = null;

        if (typeof idOrOwner === 'string') {
            instanceId = idOrOwner;
        } else if (idOrOwner && idOrOwner.shadowInstanceId) {
            instanceId = idOrOwner.shadowInstanceId;
        }

        if (instanceId && this.instances.has(instanceId)) {
            const entry = this.instances.get(instanceId);
            if (entry.owner) {
                delete entry.owner.shadowInstanceId;
            }
            this.instances.delete(instanceId);
            Logger.debug("SHADOW_INSTANCE", `Unregistered instance [${instanceId}]`);
            return true;
        }

        return false;
    }

    /**
     * 특정 ID로 인스턴스 데이터 조회
     */
    get(instanceId) {
        return this.instances.get(instanceId);
    }

    /**
     * 전체 클리어
     */
    clear() {
        this.instances.clear();
        this.nextId = 1;
        Logger.info("SHADOW_INSTANCE", "All shadow instances cleared.");
    }
}

const shadowInstanceManager = new ShadowInstanceManager();
export default shadowInstanceManager;
