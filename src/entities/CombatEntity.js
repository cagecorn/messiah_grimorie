import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import measurementManager from '../core/MeasurementManager.js';
import layerManager from '../ui/LayerManager.js';
import shadowManager from '../systems/graphics/ShadowManager.js';
import fxManager from '../systems/graphics/FXManager.js';
import animationManager from '../systems/graphics/AnimationManager.js';
import phaserParticleManager from '../systems/graphics/PhaserParticleManager.js';
import skillManager from '../systems/combat/SkillManager.js';
import ultimateManager from '../systems/combat/UltimateManager.js';
import combatManager from '../systems/CombatManager.js';
import soundManager from '../systems/SoundManager.js';
import StatusEffectManager from '../systems/combat/StatusEffectManager.js';

// [컴포넌트 임포트]
import EntitySkillComponent from './components/EntitySkillComponent.js';
import EntityMovementComponent from './components/EntityMovementComponent.js';

/**
 * 전투 엔티티 (Combat Entity)
 * 역할: [컴포넌트 조립 및 전투 라이프사이클 관리]
 */
export default class CombatEntity extends Phaser.GameObjects.Container {
    constructor(scene, x, y, logicEntity, spriteKey) {
        super(scene, x, y);
        
        this.logic = logicEntity;
        this.spriteKey = spriteKey;
        
        const config = this.getEntityConfig();
        
        // 1. 스프라이트 설정
        this.sprite = scene.add.sprite(0, 0, spriteKey);
        this.sprite.setOrigin(0.5, 1.0);
        this.sprite.setScale(config.displayScale);
        this.add(this.sprite);

        // 2. 물리 엔진 등록
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        this.body.setCircle(20, -20, -45); 

        // 3. 컴포넌트 초기화
        this.movement = new EntityMovementComponent(this, measurementManager);
        this.skills = new EntitySkillComponent(this, skillManager, ultimateManager);

        this.baseDepth = layerManager.getDepth('entities');
        this.movement.updateDepth(this.baseDepth);
        
        // 초기 방향
        if (this.logic.type === 'mercenary') {
            this.sprite.setFlipX(true);
        } else {
            this.sprite.setFlipX(false);
        }

        this.id = logicEntity.id;
        this.team = logicEntity.type;
        this.hpBar = null;
        this.attackCooldown = 0;

        this.status = new StatusEffectManager(this);

        scene.add.existing(this);
        this.setActive(true);

        fxManager.attachHUD(this);
        shadowManager.createShadow(scene, this);

        Logger.info("COMBAT_ENTITY", `Spawned ${this.logic.name} (Modular) at (${x}, ${y})`);
    }

    // ==========================================
    // 🧩 [컴포넌트 브릿지 - Getters]
    // ==========================================
    get zHeight() { return this.movement.zHeight; }
    get skillProgress() { return this.skills.skillProgress; }
    get ultimateProgress() { return this.skills.ultimateProgress; }
    get hasSkill() { return this.skills.hasSkill; }
    get hasUltimate() { return this.skills.hasUltimate; }
    get maxSkillCooldown() { return this.skills.maxSkillCooldown; }
    
    // [신규] 구조적 분리로 인한 데이터 접근 브릿지
    get skillData() { return this.skills.skillData; }
    get ultData() { return this.skills.ultData; }

    // [신규] 스킬 로직에서 게이지를 리셋(set to 0)할 수 있도록 setter 추가
    set skillProgress(v) { 
        this.skills.skillProgress = v; 
        if (this.hpBar) this.hpBar.isDirty = true;
    }
    set ultimateProgress(v) { 
        this.skills.ultimateProgress = v; 
        if (this.hpBar) this.hpBar.isDirty = true;
    }

    /**
     * 엔티티 타입 및 상태에 따른 스케일/히트박스 설정 가져오기
     */
    getEntityConfig() {
        const entityData = measurementManager.get('entity');
        let displayScale = 1.0;
        let bodyRadius = 20;

        if (this.logic.type === 'mercenary') {
            displayScale = entityData.mercenary.scale;
            bodyRadius = entityData.mercenary.bodyRadius;
        } else if (this.logic.type === 'monster') {
            displayScale = entityData.monster.scale;
            if (this.logic.id.includes('boss')) {
                displayScale = entityData.monster.bossScale;
            }
        } else if (this.logic.type === 'pet') {
            displayScale = entityData.pet[this.logic.id] || 0.5;
        }

        return { displayScale, bodyRadius };
    }

    // ==========================================
    // 🏃 [이동 시스템 - 위임]
    // ==========================================
    setVelocity(vx, vy) { this.movement.setVelocity(vx, vy); }
    stop() { this.movement.stop(); }
    setHeight(h) { this.movement.setHeight(h); }
    updateDepth() { this.movement.updateDepth(this.baseDepth); }

    // ==========================================
    // ⚔️ [전투 시스템]
    // ==========================================
    attack(target) {
        if (!target || this.attackCooldown > 0) return;
        if (this.status && this.status.isUnableToAct()) return;

        const atkSpd = this.logic.getTotalAtkSpd();
        this.attackCooldown = 1000 / Math.max(0.1, atkSpd);

        this.playAttackAnimation(target, () => {
            combatManager.executeNormalAttack(this, target);
        });
    }

    playAttackAnimation(target, onHit) {
        animationManager.playDashAttack(this, target, onHit);
    }

    takeDamage(amount, attacker) {
        if (!this.logic.isAlive) return;

        const currentHp = this.logic.stats.takeDamage(amount);
        if (this.hpBar) this.hpBar.isDirty = true;

        fxManager.flashRed(this);
        phaserParticleManager.spawnBloodBurst(this.x, this.y - this.zHeight - 40);

        if (currentHp <= 0) {
            this.handleDeath();
        }

        Logger.info("COMBAT", `${this.logic.name} took ${amount} damage. Current HP: ${currentHp}`);
    }

    heal(amount) {
        if (!this.logic.isAlive) return;
        this.logic.stats.update('current', 'hp', Math.min(this.logic.getTotalMaxHp(), this.logic.hp + amount));
        if (this.hpBar) this.hpBar.isDirty = true;
    }

    handleDeath() {
        this.logic.isDead = true;
        this.stop();
        soundManager.playUnitFallen();
        animationManager.playDeathAnimation(this, () => {
            this.destroy();
        });
        Logger.system(`${this.logic.name} has fallen.`);
    }

    updateAttackCooldown(delta) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }
        this.updateSkillCooldown(delta);
    }

    // ==========================================
    // 🧠 [스킬/궁극기 시스템 - 위임]
    // ==========================================
    updateSkillCooldown(delta) {
        this.skills.update(delta);
    }

    gainUltimateCharge(points, applyMultiplier = true) {
        this.skills.gainUltimateCharge(points, applyMultiplier);
    }

    preDestroy() {
        fxManager.detachHUD(this);
        super.preDestroy();
    }
}
