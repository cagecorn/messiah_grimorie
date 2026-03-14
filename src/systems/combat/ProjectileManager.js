import Logger from '../../utils/Logger.js';
import ThreadsOfFateProjectile from '../../entities/projectiles/skills/ThreadsOfFateProjectile.js';
import LightProjectile from '../../entities/projectiles/skills/LightProjectile.js';
import WizardProjectile from '../../entities/projectiles/skills/WizardProjectile.js';
import MeteorProjectile from '../../entities/projectiles/skills/MeteorProjectile.js';
import BardProjectile from '../../entities/projectiles/common/BardProjectile.js';
import AquaBurstProjectile from '../../entities/projectiles/common/AquaBurstProjectile.js';

/**
 * 투사체 매니저 (Projectile Manager)
 * 역할: [투사체 풀링(Pooling) 및 라이프사이클 관리]
 * 
 * 설명: 화살과 같은 수많은 투사체를 효율적으로 관리하기 위해 오브젝트 풀링을 사용합니다.
 * 매번 객체를 생성/파괴하지 않고 미리 만들어둔 객체를 재사용하여 가비지 컬렉션을 최소화합니다.
 */
class ProjectileManager {
    constructor() {
        this.scene = null;
        this.pools = new Map(); // projectileKey -> Phaser.GameObjects.Group
        this.registry = new Map(); // projectileKey -> ProjectileClass (Routing Registry)
        this.activeProjectiles = new Set();
    }

    /**
     * 씬 초기화 시 호출
     */
    init(scene) {
        this.scene = scene;
        this.pools.clear();
        this.activeProjectiles.clear();
        
        // [Routing]
        this.registerProjectile('threads_of_fate_projectile', ThreadsOfFateProjectile);
        this.registerProjectile('light', LightProjectile);
        this.registerProjectile('wizard', WizardProjectile);
        this.registerProjectile('meteor', MeteorProjectile);
        this.registerProjectile('bard', BardProjectile);
        this.registerProjectile('aqua_burst', AquaBurstProjectile);

        Logger.system("ProjectileManager: Initialized for scene.");
    }

    /**
     * 투사체 클래스 등록 (Router)
     */
    registerProjectile(key, ProjectileClass) {
        this.registry.set(key, ProjectileClass);
        Logger.info("PROJECTILE", `Registered router for: ${key}`);
    }

    /**
     * 특정 타입의 투사체 풀 가져오기 또는 생성
     * @param {string} key 투사체 식별자
     */
    getPool(key) {
        if (!this.pools.has(key)) {
            const ProjectileClass = this.registry.get(key);
            if (!ProjectileClass) {
                Logger.error("PROJECTILE", `No class registered for ${key}! Register it first.`);
                return null;
            }

            const pool = this.scene.add.group({
                classType: ProjectileClass,
                maxSize: 500, // 최대 수백 개까지 수용
                runChildUpdate: true
            });
            this.pools.set(key, pool);
            Logger.info("PROJECTILE", `Created pool for: ${key}`);
        }
        return this.pools.get(key);
    }

    /**
     * 투사체 발사 (Router 활용)
     * @param {string} key 투사체 식별자
     * @param {CombatEntity} owner 시전자
     * @param {CombatEntity} target 타겟
     * @param {object} config 추가 설정
     */
    fire(key, owner, target, config = {}) {
        const pool = this.getPool(key);
        if (!pool) return null;

        let projectile = pool.get();

        if (!projectile) {
            Logger.warn("PROJECTILE", `Pool exhausted for ${key}! Max size reached.`);
            return null;
        }

        // 투사체 초기화 및 발사
        projectile.launch(owner, target, config);
        this.activeProjectiles.add(projectile);

        return projectile;
    }

    /**
     * 투사체 풀로 반환
     */
    release(projectile) {
        if (!projectile) return;
        
        projectile.setActive(false);
        projectile.setVisible(false);
        this.activeProjectiles.delete(projectile);
        
        // Phaser Group의 killAndHide 처리와 유사하지만 명시적으로 관리
        // (pool.get()은 isActive(false)인 객체를 우선적으로 가져옴)
    }

    /**
     * 씬 정리 시 호출
     */
    clear() {
        this.activeProjectiles.clear();
        this.pools.forEach(pool => pool.destroy(true));
        this.pools.clear();
        Logger.info("PROJECTILE", "Cleared all projectile pools.");
    }
}

const projectileManager = new ProjectileManager();
export default projectileManager;
