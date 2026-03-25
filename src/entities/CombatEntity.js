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
import characterInfoManager from '../systems/CharacterInfoManager.js';

// [컴포넌트 임포트]
import EntitySkillComponent from './components/EntitySkillComponent.js';
import EntityMovementComponent from './components/EntityMovementComponent.js';
import EntityVisualComponent from './components/EntityVisualComponent.js';
import EntityCombatComponent from './components/EntityCombatComponent.js';
import EntityActionComponent from './components/EntityActionComponent.js';
import EntityStaminaComponent from './components/EntityStaminaComponent.js';
import { ENTITY_CLASSES } from '../core/EntityConstants.js';
import FlyingBuff from '../systems/combat/effects/FlyingBuff.js';

import poolingManager from '../core/PoolingManager.js';

/**
 * 전투 엔티티 (Combat Entity)
 * 역할: [컴포넌트 조립 및 전투 라이프사이클 관리]
 */
export default class CombatEntity extends Phaser.GameObjects.Container {
    constructor(scene, x, y, logicEntity, spriteKey) {
        super(scene, x, y);
        this.poolType = null;
        this.isBeingCarried = false; 
        this.isBusy = false; // [신규] 스킬/궁극기 시전 중 다른 행동 제약용 상위 플래그
        scene.add.existing(this);
        this.init(x, y, logicEntity, spriteKey);
    }

    get sprite() {
        return this.visual ? this.visual.sprite : null;
    }

    /**
     * 초기화 로직 (풀링 재사용 시에도 호출됨)
     */
    init(x, y, logicEntity, spriteKey) {
        if (!logicEntity) {
            Logger.error("COMBAT_ENTITY", "Failed to initialize: logicEntity is null.");
            return;
        }
        this.logic = logicEntity;
        this.spriteKey = spriteKey;
        this.id = logicEntity.id;
        this.team = logicEntity.type;
        this.alpha = 1;
        this.setPosition(x, y);

        // 1. 물리 엔진 등록 (씬 재시작 시점에 physics가 로드되지 않았을 수 있으므로 방어 처리)
        if (this.scene.physics) {
            if (!this.body) {
                this.scene.physics.add.existing(this);
                this.body.setCollideWorldBounds(true);
                this.body.setCircle(20, -20, -45);
            } else {
                this.body.setEnable(true);
            }
        }

        // 2. 비주얼 컴포넌트 우선 초기화 (스프라이트 생성)
        if (!this.visual) {
            this.visual = new EntityVisualComponent(this, animationManager, fxManager, shadowManager, layerManager);
        }
        const config = this.getEntityConfig();
        this.visual.init(spriteKey, config.displayScale);

        // 3. 물리 및 이동 컴포넌트 (비주얼 이후)
        if (!this.movement) {
            this.movement = new EntityMovementComponent(this, measurementManager);
        } else {
            this.movement.syncLogic();
            this.movement.setHeight(0);
        }

        // 4. 스킬 및 전투 관리
        if (!this.skills) {
            this.skills = new EntitySkillComponent(this, skillManager, ultimateManager);
        } else {
            this.skills.reset(skillManager, ultimateManager);
        }

        if (!this.combat) {
            this.combat = new EntityCombatComponent(this, combatManager, animationManager, fxManager, phaserParticleManager, soundManager, poolingManager);
        } else {
            this.combat.syncLogic();
            this.combat.attackCooldown = 0;
        }

        // 5. 스태미나 관리
        if (!this.stamina) {
            this.stamina = new EntityStaminaComponent(this);
        } else {
            this.stamina.reset();
        }

        // 6. 액션 관리 (구르기 등)
        if (!this.actions) {
            this.actions = new EntityActionComponent(this);
        } else {
            this.actions.reset();
        }

        this.baseDepth = layerManager.getDepth('entities');
        this.updateDepth();

        this.setActive(true);
        this.setVisible(true);

        // 5. 모든 컴포넌트 준비 완료 후 외부 매니저(HUD, 그림자 등) 연결
        this.visual.attachManagers();

        // [보안] 풀링에서 꺼낸 객체를 현재 활성화된 씬의 엔티티 레이어에 다시 정렬
        this.scene.add.existing(this);
        layerManager.assignToLayer(this, 'entities');

        // [복구] 컴뱃 매니저에 유닛 등록 (이게 빠져서 (0,0)으로 끌려가는 버그 발생)
        combatManager.addUnit(this);

        Logger.info("COMBAT_ENTITY", `Initialized ${this.logic.name} (Modular) at (${Math.round(this.x)}, ${Math.round(this.y)})`);

        // [ELITE] 엘리트 비주얼 효과 (색상 변경)
        if (this.logic.isElite && this.sprite) {
            this.sprite.setTint(0xffd700); // 금색 (Elite Gold)
            Logger.debug("COMBAT_ENTITY", `${this.logic.name} is Elite! Visual scale and tint applied.`);
        }

        // 6. 마우스 인터랙션 설정 (우클릭 정보창 확장)
        this.setupInteractions();

        // 7. [신규] 엔티티 매니저 등록 (아이템 수집 및 타겟팅 최적화)
        import('../core/EntityManager.js').then(m => {
            m.default.register(this, this.team);
        });

        // [FLYING] 플라잉맨 클래스는 탄생 시점부터 비행 상태 적용
        if (this.logic.class && this.logic.class.getClassName() === ENTITY_CLASSES.FLYINGMAN) {
            FlyingBuff.apply(this);
        }
    }

    setupInteractions() {
        // 컨테이너 히트박스 설정 (Phaser Circle 바디 활용)
        const radius = this.body ? this.body.radius : 20;
        this.setInteractive(new Phaser.Geom.Circle(0, 0, radius * 2), Phaser.Geom.Circle.Contains);

        this.on('pointerdown', (pointer) => {
            // 우클릭 (Right Click, Button index 2)
            if (pointer.button === 2) {
                console.log(`[CombatEntity] Right-click detected on: ${this.logic.name}`);
                characterInfoManager.setTarget(this, 'combat');
            }
        });

        // 우클릭 시 브라우저 메뉴 출력 방지 (글로벌 캔버스 레벨 및 개별 이벤트 강화)
        this.sprite.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                if (pointer.event) {
                    pointer.event.preventDefault();
                    pointer.event.stopPropagation();
                }
            }
        });

        // 씬 입력 전체에서 우클릭 메뉴 차단 보장
        if (this.scene.input && this.scene.input.mouse) {
            this.scene.input.mouse.disableContextMenu();
        }

        // 브라우저 레벨의 강력 차단 (안전장치 - 윈도우 캡처링 단계에서 딱 한 번만 등록)
        if (!CombatEntity._contextMenuBlocked) {
            window.addEventListener('contextmenu', (e) => {
                // 특정 게임 서비스나 레이어가 활성화된 경우에만 차단할 수도 있지만, 
                // 현재는 전체 게임 경험을 위해 전역 차단 유지
                e.preventDefault();
                e.stopPropagation();
            }, true);
            CombatEntity._contextMenuBlocked = true;
        }
    }

    // 전역 플래그
    static _contextMenuBlocked = false;

    onAcquire() { }

    onRelease() {
        // [신규] 풀에 반납될 때 매니저에서 제거
        combatManager.removeUnit(this);
        
        import('../core/EntityManager.js').then(m => {
            m.default.unregister(this, this.team);
        });

        this.setActive(false);
        this.setVisible(false);
        if (this.body) this.body.setEnable(false);

        // 비주얼 컴포넌트 정리 (Shadow, FX, Bobbing 중단)
        if (this.visual) this.visual.cleanup();

        this.isBusy = false;
        this.poolType = null;
    }

    // ==========================================
    // 🧩 [컴포넌트 브릿지 - Getters/Setters]
    // ==========================================
    get status() { return this.logic ? this.logic.status : null; }
    get buffs() { return this.logic ? this.logic.buffs : null; }
    get sprite() { return this.visual ? this.visual.sprite : null; }
    get zHeight() { return this.movement.zHeight; }
    get skillProgress() { return this.skills.skillProgress; }
    get ultimateProgress() { return this.skills.ultimateProgress; }
    get hasSkill() { return this.skills.hasSkill; }
    get hasUltimate() { return this.skills.hasUltimate; }
    get maxSkillCooldown() { return this.skills.maxSkillCooldown; }
    get attackCooldown() { return this.combat.attackCooldown; }
    get staminaProgress() { return this.stamina.getProgress(); }

    // [신규] 구조적 분리로 인한 데이터 접근 브릿지
    get skillData() { return this.skills.skillData; }
    get ultData() { return this.skills.ultData; }

    // [ACTION 브릿지]
    isRolling() { return this.actions && this.actions.isRolling; }
    isDashing() { return this.actions && this.actions.isDashing; }
    roll(dir) { return this.actions && this.actions.roll(dir); }
    dash(dir) { return this.actions && this.actions.dash(dir); }

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
            } else if (this.logic.isElite) {
                displayScale *= 1.2; // [ELITE] 일반 몬스터의 1.2배 크기
            }
        } else if (this.logic.type === 'pet') {
            displayScale = entityData.pet[this.logic.id] || 0.5;
        } else if (this.logic.type === 'summon') {
            displayScale = entityData.summon.scale;
            bodyRadius = entityData.summon.bodyRadius;
        }

        return { displayScale, bodyRadius };
    }

    // ==========================================
    // 🏃 [이동 & 물리 위임]
    // ==========================================
    setVelocity(vx, vy) { this.movement.setVelocity(vx, vy); }
    stop() { this.movement.stop(); }
    setHeight(h) { this.movement.setHeight(h); }
    updateDepth() { if (this.visual) this.visual.updateDepth(this.baseDepth, measurementManager); }

    // ==========================================
    // ⚔️ [전투 & 상태 위임]
    // ==========================================
    attack(target) { this.combat.attack(target); }
    takeDamage(amount, attacker) { this.combat.takeDamage(amount, attacker); }
    heal(amount) { this.combat.heal(amount); }
    handleDeath() { this.combat.handleDeath(); }

    updateAttackCooldown(delta) {
        // [Safety] 들려있는 상태라면 물리/논리 업데이트 중단
        if (this.isBeingCarried) {
            if (this.body) this.body.setVelocity(0, 0);
            return;
        }

        this.combat.update(delta);
        this.skills.update(delta);
        this.stamina.update(delta);
        this.actions.update(delta);
        this.visual.updateIdleState(); // 아이들 바빙 체크

        // [신규] 은신 잔상 및 나나 변신 잔상 효과 (GhostManager 연동)
        const isMoving = this.body && (Math.abs(this.body.velocity.x) > 10 || Math.abs(this.body.velocity.y) > 10);
        const isNanaRogue = this.logic.baseId === 'nana' && this.logic.class.getClassName() === 'rogue';
        
        if (this.active && isMoving && (this.isStealthed || isNanaRogue)) {
            if (Math.random() < 0.3) { // 빈도 약간 상향
                import('../systems/graphics/GhostManager.js').then(m => {
                    const tint = isNanaRogue ? 0xff0000 : 0x6666ff; // 나나는 빨간색, 은신은 파란색
                    const alpha = isNanaRogue ? 0.5 : 0.3;
                    m.default.spawnGhost(this, { lifeTime: 500, alpha: alpha, tint: tint });
                });
            }
        }
    }

    gainUltimateCharge(points, applyMultiplier = true) {
        this.skills.gainUltimateCharge(points, applyMultiplier);
    }

    // [신규] 스킬 및 궁극기 실행 프록시
    isSkillReady(skillId) { return this.skills.isReady(skillId); }
    useSkill(skillId, target) { return this.skills.useSkill(skillId, target); }
    isUltimateReady() { return this.skills.isUltimateReady(); }
    useUltimate(target) { return this.skills.useUltimate(target); }

    // [신규] 액션 실행 프록시
    roll(direction) { return this.actions.roll(direction); }
    isRolling() { return this.actions.isRolling; }
    isInvincible() { 
        const actionInvincible = this.actions && this.actions.isInvincible();
        const statusInvincible = (this.status && this.status.states) ? this.status.states.invincible : false;
        return actionInvincible || statusInvincible;
    }

    preDestroy() {
        combatManager.removeUnit(this);
        if (this.visual) this.visual.cleanup();
        super.preDestroy();
    }
}
