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

import poolingManager from '../core/PoolingManager.js';

/**
 * 전투 엔티티 (Combat Entity)
 * 역할: [컴포넌트 조립 및 전투 라이프사이클 관리]
 */
export default class CombatEntity extends Phaser.GameObjects.Container {
    constructor(scene, x, y, logicEntity, spriteKey) {
        super(scene, x, y);
        
        // [신규] 풀링 정보 (poolingManager 연동용)
        this.poolType = null;
        
        // [중요] 씬의 출력 목록에 추가
        scene.add.existing(this);
        
        this.init(x, y, logicEntity, spriteKey);
    }

    /**
     * 초기화 로직 (풀링 재사용 시에도 호출됨)
     */
    init(x, y, logicEntity, spriteKey) {
        this.logic = logicEntity;
        this.spriteKey = spriteKey;
        this.id = logicEntity.id;
        this.team = logicEntity.type;
        this.attackCooldown = 0;
        this.alpha = 1;
        this.setPosition(x, y);

        const config = this.getEntityConfig();

        // 1. 스프라이트 설정 (이미 생성되어 있다면 텍스처만 변경)
        if (!this.sprite) {
            this.sprite = this.scene.add.sprite(0, 0, spriteKey);
            this.sprite.setOrigin(0.5, 1.0);
            this.add(this.sprite);
        } else {
            this.sprite.setTexture(spriteKey);
            this.sprite.setAngle(0);
            this.sprite.setPosition(0, 0);
            this.sprite.setAlpha(1);
            this.sprite.clearTint();
        }
        this.sprite.setScale(config.displayScale);

        // 2. 물리 엔진 등록
        if (!this.body) {
            this.scene.physics.add.existing(this);
            this.body.setCollideWorldBounds(true);
            this.body.setCircle(20, -20, -45); 
        } else {
            this.body.setEnable(true);
        }

        // 3. 컴포넌트 초기화
        if (!this.movement) {
            this.movement = new EntityMovementComponent(this, measurementManager);
        } else {
            this.movement.setHeight(0);
        }

        if (!this.skills) {
            this.skills = new EntitySkillComponent(this, skillManager, ultimateManager);
        } else {
            this.skills.reset(skillManager, ultimateManager); // 게이지 등 초기화 필요
        }

        this.baseDepth = layerManager.getDepth('entities');
        this.updateDepth();

        // 4. 상태 및 시각 효과 초기화
        if (!this.status) {
            this.status = new StatusEffectManager(this);
        } else {
            this.status.clearAll();
        }

        // 초기 방향
        if (this.logic.type === 'mercenary') {
            this.sprite.setFlipX(true);
        } else {
            this.sprite.setFlipX(false);
        }

        this.setActive(true);
        this.setVisible(true);

        fxManager.attachHUD(this);
        shadowManager.createShadow(this.scene, this);

        Logger.info("COMBAT_ENTITY", `Initialized ${this.logic.name} at (${Math.round(this.x)}, ${Math.round(this.y)})`);
    }

    onAcquire() {
        // 실제 데이터 주입은 SpawnManager에서 init() 호출로 처리
    }

    onRelease() {
        this.setActive(false);
        this.setVisible(false);
        if (this.body) this.body.setEnable(false);
        
        fxManager.detachHUD(this);
        shadowManager.removeShadow(this);
        
        this.poolType = null;
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
        const className = this.logic.class.getClassName();
        const isMelee = className === 'warrior' || this.logic.type === 'monster';
        
        if (isMelee) {
            animationManager.playDashAttack(this, target, onHit);
        } else {
            // 원거리 클래스는 대쉬 없이 제자리에서 공격 (타이밍 조절 가능)
            // 추후 'Shoot' 전용 애니메이션 Tweens가 필요하다면 여기서 처리
            this.scene.time.delayedCall(100, onHit);
        }
    }

    takeDamage(amount, attacker) {
        if (!this.logic.isAlive) return;

        const currentHp = this.logic.stats.takeDamage(amount);
        if (this.hpBar) {
            this.hpBar.isDirty = true;
            this.hpBar.shake(); // [신규] 피격 시 HP바 진동
        }

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

        // [USER 요청] 사망 시 즉시 HP바 제거 (지연 방지)
        fxManager.detachHUD(this);

        animationManager.playDeathAnimation(this, () => {
            if (this.poolType) {
                poolingManager.release(this.poolType, this);
            } else {
                this.destroy();
            }
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
