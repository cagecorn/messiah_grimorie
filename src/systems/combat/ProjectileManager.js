import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import measurementManager from '../../core/MeasurementManager.js';
// [MOVE] Specific projectile imports moved to dynamic imports in init() to break circular dependency cycles

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
        this.grid = null; // [신규] 공간 분할 격자
    }

    /**
     * 씬 초기화 시 호출 (Async for dynamic imports)
     */
    async init(scene) {
        this.scene = scene;
        this.pools.clear();
        this.activeProjectiles.clear();

        // 1. 격자 시스템 초기화 (투사체 감지 최적화용)
        const world = measurementManager.world;
        this.grid = {
            cellSize: 150,
            cols: Math.ceil(world.width / 150),
            rows: Math.ceil(world.height / 150),
            cells: []
        };
        // 2D 배열 초기화
        for (let i = 0; i < this.grid.cols * this.grid.rows; i++) {
            this.grid.cells[i] = new Set();
        }
        
        // [Routing] 병렬 동적 임포트로 성능 최적화 및 순환 참조 방지
        const [
            ThreadsOfFateProjectile,
            LightProjectile,
            WizardProjectile,
            MeteorProjectile,
            BardProjectile,
            AquaBurstProjectile,
            FireBurstProjectile,
            ImSorryProjectile,
            MeleeProjectile,
            HeroDashProjectile,
            RapidFireProjectile,
            MonsterNonTargetProjectile,
            BulletProjectile,
            TornadoShotProjectile,
            ShadowProjectile,
            GoBabaoProjectile,
            IceBallProjectile,
            StoneBlastProjectile,
            IceStormProjectile,
            RockProjectile,
            MagentaDriveProjectile,
            ArrowProjectile,
            KnockbackShotProjectile,
            ElectricGrenadeProjectile
        ] = await Promise.all([
            import('../../entities/projectiles/skills/ThreadsOfFateProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/LightProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/WizardProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/MeteorProjectile.js').then(m => m.default),
            import('../../entities/projectiles/common/BardProjectile.js').then(m => m.default),
            import('../../entities/projectiles/common/AquaBurstProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/FireBurstProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/ImSorryProjectile.js').then(m => m.default),
            import('../../entities/projectiles/common/MeleeProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/HeroDashProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/RapidFireProjectile.js').then(m => m.default),
            import('../../entities/projectiles/MonsterNonTargetProjectile.js').then(m => m.default),
            import('../../entities/projectiles/common/BulletProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/TornadoShotProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/ShadowProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/GoBabaoProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/IceBallProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/StoneBlastProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/IceStormProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/RockProjectile.js').then(m => m.default),
            import('../../entities/projectiles/special/MagentaDriveProjectile.js').then(m => m.default),
            import('../../entities/projectiles/common/ArrowProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/KnockbackShotProjectile.js').then(m => m.default),
            import('../../entities/projectiles/skills/ElectricGrenadeProjectile.js').then(m => m.default)
        ]);

        this.registerProjectile('threads_of_fate_projectile', ThreadsOfFateProjectile);
        this.registerProjectile('light', LightProjectile);
        this.registerProjectile('wizard', WizardProjectile);
        this.registerProjectile('meteor', MeteorProjectile);
        this.registerProjectile('bard', BardProjectile);
        this.registerProjectile('aqua_burst', AquaBurstProjectile);
        this.registerProjectile('fire_burst', FireBurstProjectile);
        this.registerProjectile('im_sorry_emoji', ImSorryProjectile);
        this.registerProjectile('melee', MeleeProjectile);
        this.registerProjectile('hero_dash', HeroDashProjectile);
        this.registerProjectile('rapid_fire_container', RapidFireProjectile);
        this.registerProjectile('monster_nontarget', MonsterNonTargetProjectile);
        this.registerProjectile('bullet', BulletProjectile);
        this.registerProjectile('tornado_shot', TornadoShotProjectile);
        this.registerProjectile('shadow_dive', ShadowProjectile);
        this.registerProjectile('go_babao_projectile', GoBabaoProjectile);
        this.registerProjectile('ice_ball', IceBallProjectile);
        this.registerProjectile('stone_blast', StoneBlastProjectile);
        this.registerProjectile('ice_storm_projectile', IceStormProjectile);
        this.registerProjectile('rock', RockProjectile);
        this.registerProjectile('magenta_drive', MagentaDriveProjectile);
        this.registerProjectile('arrow', ArrowProjectile);
        this.registerProjectile('knockback_shot', KnockbackShotProjectile);
        this.registerProjectile('electric_grenade', ElectricGrenadeProjectile);

        Logger.system("ProjectileManager: Initialized for scene with dynamic routing.");
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
     * 활성 투사체 업데이트 루프
     */
    update(time, delta) {
        if (this.activeProjectiles.size === 0) {
            if (this.grid) this.clearGrid();
            return;
        }

        // 1. 격자 초기화
        this.clearGrid();

        this.activeProjectiles.forEach(projectile => {
            if (projectile.active) {
                // 2. 격자에 삽입
                this.insertToGrid(projectile);

                if (projectile.update) {
                    projectile.update(time, delta);
                }
            } else {
                this.activeProjectiles.delete(projectile);
            }
        });
    }

    clearGrid() {
        if (!this.grid) return;
        for (let i = 0; i < this.grid.cells.length; i++) {
            this.grid.cells[i].clear();
        }
    }

    insertToGrid(proj) {
        const col = Math.floor(proj.x / this.grid.cellSize);
        const row = Math.floor(proj.y / this.grid.cellSize);
        if (col >= 0 && col < this.grid.cols && row >= 0 && row < this.grid.rows) {
            const idx = col + row * this.grid.cols;
            this.grid.cells[idx].add(proj);
        }
    }

    /**
     * 특정 범위 내의 투사체 검색 (Optimized)
     */
    getProjectilesInRange(x, y, range) {
        const result = [];
        if (!this.grid) return Array.from(this.activeProjectiles);

        const left = Math.floor((x - range) / this.grid.cellSize);
        const right = Math.floor((x + range) / this.grid.cellSize);
        const top = Math.floor((y - range) / this.grid.cellSize);
        const bottom = Math.floor((y + range) / this.grid.cellSize);

        for (let c = Math.max(0, left); c <= Math.min(this.grid.cols - 1, right); c++) {
            for (let r = Math.max(0, top); r <= Math.min(this.grid.rows - 1, bottom); r++) {
                const idx = c + r * this.grid.cols;
                this.grid.cells[idx].forEach(proj => {
                    const distSq = (proj.x - x) ** 2 + (proj.y - y) ** 2;
                    if (distSq <= range * range) {
                        result.push(proj);
                    }
                });
            }
        }
        return result;
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
