import Logger from '../utils/Logger.js';
import { COMBAT } from '../core/TechnicalConstants.js';
import TimeManager from '../core/TimeManager.js';
import measurementManager from '../core/MeasurementManager.js';
import soundManager from './SoundManager.js';
import damageCalculationManager from './combat/DamageCalculationManager.js';
import projectileManager from './combat/ProjectileManager.js';
import ArrowProjectile from '../entities/projectiles/common/ArrowProjectile.js';
import BardProjectile from '../entities/projectiles/common/BardProjectile.js';
import AquaBurstProjectile from '../entities/projectiles/common/AquaBurstProjectile.js';
import fxManager from './graphics/FXManager.js';

/**
 * 공간 분할 격자 (Spatial Partitioning Grid)
 * 역할: [O(N^2) 연산을 O(N)으로 단축하기 위한 공간 인덱서]
 */
class SpatialGrid {
    constructor(width, height, cellSize = 120) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.cells = new Array(this.cols * this.rows).fill(null).map(() => new Set());
    }

    clear() {
        this.cells.forEach(cell => cell.clear());
    }

    insert(entity) {
        const idx = this.getIndex(entity.x, entity.y);
        if (idx !== -1) this.cells[idx].add(entity);
    }

    getIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return -1;
        return col + row * this.cols;
    }

    /**
     * 특정 범위 내의 엔티티 검색
     */
    query(x, y, range) {
        const result = [];
        const left = Math.floor((x - range) / this.cellSize);
        const right = Math.floor((x + range) / this.cellSize);
        const top = Math.floor((y - range) / this.cellSize);
        const bottom = Math.floor((y + range) / this.cellSize);

        for (let c = Math.max(0, left); c <= Math.min(this.cols - 1, right); c++) {
            for (let r = Math.max(0, top); r <= Math.min(this.rows - 1, bottom); r++) {
                const idx = c + r * this.cols;
                this.cells[idx].forEach(entity => {
                    const distSq = (entity.x - x) ** 2 + (entity.y - y) ** 2;
                    if (distSq <= range * range) {
                        result.push(entity);
                    }
                });
            }
        }
        return result;
    }
}

/**
 * 컴뱃 매니저 (Combat Manager)
 * 역할: [전투 로직의 중앙 라우터]
 * 
 * 설명: 1000마리 이상의 유닛이 참여하는 대규모 전투를 처리하기 위한 연산 허브입니다.
 */
class CombatManager {
    constructor() {
        this.units = new Set();  // 현재 전장에 존재하는 모든 유닛 (용병+몬스터)
        this.grid = null;        // 공간 분할 격자 (Spatial Partitioning Grid)
        this.scene = null;       // 씬 참조
        this.centerOfMass = { x: 0, y: 0 }; // [신규] 아군 중심점 (프레임당 1회 계산)
        
        Logger.system("CombatManager: Initialized with SpatialGrid capacity.");
    }

    init(scene) {
        this.scene = scene;
        const world = measurementManager.world;
        // 격자 시스템 초기화 (셀 크기 120px - 투사체 감지 범위 300px 고려)
        this.grid = new SpatialGrid(world.width, world.height, 150);
        Logger.system(`CombatManager: SpatialGrid initialized (${this.grid.cols}x${this.grid.rows})`);
    }

    /**
     * 전투 업데이트 루프
     */
    update(delta) {
        if (!TimeManager.shouldUpdate()) return;
        
        // 1. 공간 격자 갱신
        this.refreshSpatialGrid();
        
        // 2. [신규] 아군 중심점 중앙 집중 계산 (O(N) 1회만 수행)
        this.updateGroupCenter();
    }

    /**
     * 아군(용병)의 무게 중심 계산 (프레임당 1회)
     */
    updateGroupCenter() {
        let sumX = 0, sumY = 0, count = 0;
        this.units.forEach(unit => {
            if (unit.active && unit.team === 'mercenary') {
                sumX += unit.x;
                sumY += unit.y;
                count++;
            }
        });

        if (count > 0) {
            this.centerOfMass.x = sumX / count;
            this.centerOfMass.y = sumY / count;
        }
    }

    /**
     * 투사체 발사 (원거리 공격)
     */
    fireProjectile(type, attacker, target, multiplier = 1.0) {
        if (type === 'arrow') {
            projectileManager.fire('arrow', attacker, target, {
                damageMultiplier: multiplier
            });
        } else if (type === 'light') {
            projectileManager.fire('light', attacker, target, {
                damageMultiplier: multiplier
            });
        } else if (type === 'wizard') {
            projectileManager.fire('wizard', attacker, target, {
                damageMultiplier: multiplier
            });
        } else if (type === 'meteor') {
            projectileManager.fire('meteor', attacker, target, {
                damageMultiplier: multiplier
            });
        } else if (type === 'bard') {
            projectileManager.fire('bard', attacker, target, {
                damageMultiplier: multiplier
            });
        } else if (type === 'aqua_burst') {
            projectileManager.fire('aqua_burst', attacker, target, {
                damageMultiplier: multiplier
            });
        }
    }

    /**
     * 데미지 발생 라우팅
     */
    processDamage(attackerEntity, targetEntity, config = {}, type = 'physical', isUltimate = false) {
        // config가 숫자(multiplier)일 수도 있고 객체({multiplier, projectileId})일 수도 있음
        let multiplier = 1.0;
        let projectileId = null;

        if (typeof config === 'number') {
            multiplier = config;
        } else if (typeof config === 'object') {
            multiplier = config.multiplier !== undefined ? config.multiplier : 1.0;
            projectileId = config.projectileId || null;
        }

        const attacker = attackerEntity.logic;
        const target = targetEntity.logic;
        
        let damage = 0;
        if (type === 'physical') {
            damage = COMBAT.calcPhysicalDamage(attacker.getTotalAtk(), multiplier);
        } else {
            damage = COMBAT.calcMagicEffect(attacker.getTotalMAtk(), multiplier);
        }

        if (targetEntity && targetEntity.takeDamage) {
            // [DEBUG] 소환수(Siren) 또는 마법 데미지 전용 특화 로그 (사용자 요청: 필터링 용이성)
            const isSiren = attacker.name && attacker.name.toLowerCase().includes('siren');
            if (isSiren || type === 'magic') {
                Logger.info("AQUA_SIREN", `[${attacker.name}] deals ${damage.toFixed(1)} magic damage to ${target.name} (MAtk: ${attacker.getTotalMAtk()}, Mult: ${multiplier})`);
            }

            Logger.info("COMBAT_MANAGER", `Processing ${type} damage: ${attacker.name} (Atk:${attacker.getTotalAtk()}, MAtk:${attacker.getTotalMAtk()}) -> ${target.name} (${damage}) ${projectileId ? `[Proj: ${projectileId}]` : ''}`);
            targetEntity.takeDamage(damage, attackerEntity);
            
            // 데미지 기록 (투사체 ID가 있으면 함께 기록)
            damageCalculationManager.recordDamage(attacker, target, damage, type, projectileId);
            
            fxManager.showDamageText(targetEntity.x, targetEntity.y, damage, type);
            fxManager.showImpactEffect(targetEntity, type);

            if (type === 'physical') {
                soundManager.playPhysicalHit();
            } else if (projectileId && projectileId.includes('bard')) {
                // 바드 음표 타격음
                soundManager.playMusicHit();
            }

            if (!isUltimate && attackerEntity.gainUltimateCharge) {
                attackerEntity.gainUltimateCharge(1);
            }

            if (targetEntity.gainUltimateCharge) {
                targetEntity.gainUltimateCharge(1);
            }
        }
    }

    /**
     * 일반 공격 실행 (AI에서 호출)
     */
    executeNormalAttack(attackerEntity, targetEntity) {
        if (!attackerEntity.active || !targetEntity.active) return;
        if (!attackerEntity.logic.isAlive || !targetEntity.logic.isAlive) return;

        const isAlly = attackerEntity.team === targetEntity.team;
        const className = attackerEntity.logic.class.getClassName();

        if (isAlly && className === 'healer') {
            this.processHeal(attackerEntity, targetEntity, 1.0);
        } else if (isAlly && className === 'bard') {
            this.processInspiration(attackerEntity, targetEntity, 1.0);
        } else if (!isAlly) {
            // [USER 요청] 힐러는 빛의 투사체(light) 발사
            if (className === 'healer') {
                this.fireProjectile('light', attackerEntity, targetEntity, 1.0);
            } else if (className === 'wizard') {
                this.fireProjectile('wizard', attackerEntity, targetEntity, 1.0);
            } else if (className === 'archer') {
                this.fireProjectile('arrow', attackerEntity, targetEntity, 1.0);
            } else {
                this.processDamage(attackerEntity, targetEntity, 1.0, 'physical');
            }
        }
    }

    /**
     * 힐 발생 라우팅
     */
    processHeal(healerEntity, targetEntity, multiplier = 1.0) {
        const healer = healerEntity.logic;
        const target = targetEntity.logic;

        const healAmount = healer.getTotalMAtk() * multiplier;

        if (targetEntity && targetEntity.heal) {
            Logger.info("COMBAT_MANAGER", `Processing HEAL: ${healer.name} -> ${target.name} (${healAmount.toFixed(1)})`);
            targetEntity.heal(healAmount);
            damageCalculationManager.recordHeal(healer, target, healAmount);
            fxManager.showDamageText(targetEntity.x, targetEntity.y, Math.floor(healAmount), 'heal');
            fxManager.showHealEffect(targetEntity);
        }
    }

    /**
     * 바드 영감(Inspiration) 버프 발생 라우팅
     */
    processInspiration(bardEntity, targetEntity, multiplier = 1.0) {
        const bard = bardEntity.logic;
        const target = targetEntity.logic;

        const buffValue = bard.getTotalMAtk() * multiplier;
        const duration = 5000; // 5초 지속

        if (target.buffs) {
            Logger.info("COMBAT_MANAGER", `Processing INSPIRATION: ${bard.name} -> ${target.name} (+${buffValue.toFixed(1)})`);
            
            // [USER 요청] 공격력 및 마법 공격력 버프 둘 다(Both) 추가
            target.buffs.addBuff({
                id: 'inspiration_atk',
                key: 'atk',
                value: buffValue,
                type: 'add',
                duration: duration
            });
            target.buffs.addBuff({
                id: 'inspiration_matk',
                key: 'mAtk',
                value: buffValue,
                type: 'add',
                duration: duration
            });

            // 시각 효과
            fxManager.showInspirationEffect(targetEntity);
            
            // 효과음 제거 (유저 요청: 너무 자주 발생하여 노이로제 유발)
            // soundManager.playSound('magic_hit_1', 0.4);
        }
    }

    /**
     * 바드 보호의 노래(Song of Protection) 스킬 처리
     */
    processSongOfProtection(owner, shieldAmount) {
        let count = 0;
        
        // 1. 일차적으로 등록된 유닛들 검색
        let targets = Array.from(this.units);
        
        // [Fallback] 만약 등록된 유닛이 없다면 씬의 리스트를 직접 참조 (MassHeal 방식)
        if (targets.length === 0 && owner.scene) {
            Logger.warn("COMBAT_MANAGER", "Units set is empty. Falling back to scene.allies/enemies.");
            targets = (owner.team === 'mercenary') ? owner.scene.allies : owner.scene.enemies;
        }

        Logger.info("COMBAT_MANAGER", `Searching targets for Song of Protection. Pool size: ${targets.length}`);

        targets.forEach(unit => {
            if (unit.active && unit.logic && unit.logic.isAlive && unit.team === owner.team) {
                // 보호막 부여
                if (unit.logic.shields) {
                    unit.logic.shields.addShield({
                        id: `song_of_protection_${owner.id}_${Date.now()}`,
                        amount: shieldAmount,
                        duration: 5000 // 5초
                    });
                }

                // [시각 효과] 개별 유닛 보호막 오버레이
                if (fxManager.showShieldOverlay) {
                    fxManager.showShieldOverlay(unit, 5000);
                }

                // HP바 즉시 갱신 유도
                if (unit.hpBar) {
                    unit.hpBar.isDirty = true;
                }
                count++;
            }
        });

        Logger.info("COMBAT", `Song of Protection applied shield (+${shieldAmount.toFixed(1)}) to ${count} allies.`);
    }

    refreshSpatialGrid() {
        if (!this.grid) return;
        this.grid.clear();
        this.units.forEach(unit => {
            if (unit.active) this.grid.insert(unit);
        });
    }

    /**
     * 주변 유닛 검색 (Optimized by Grid)
     */
    getUnitsInRange(x, y, range) {
        if (!this.grid) return Array.from(this.units); // Fallback
        return this.grid.query(x, y, range);
    }

    addUnit(unit) { 
        this.units.add(unit); 
        Logger.system(`CombatManager: Unit Registered -> [${unit.logic.name}] (Team: ${unit.team}) Total: ${this.units.size}`);
    }

    removeUnit(unit) { 
        this.units.delete(unit); 
        Logger.info("COMBAT_MANAGER", `Unit Deregistered: ${unit.logic.name}`);
    }
}

const combatManager = new CombatManager();
export default combatManager;
