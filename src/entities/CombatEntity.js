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

import poolingManager from '../core/PoolingManager.js';

/**
 * 전투 엔티티 (Combat Entity)
 * 역할: [컴포넌트 조립 및 전투 라이프사이클 관리]
 */
export default class CombatEntity extends Phaser.GameObjects.Container {
    constructor(scene, x, y, logicEntity, spriteKey) {
        super(scene, x, y);
        this.poolType = null;
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
        this.alpha = 1;
        this.setPosition(x, y);

        // 1. 물리 엔진 등록
        if (!this.body) {
            this.scene.physics.add.existing(this);
            this.body.setCollideWorldBounds(true);
            this.body.setCircle(20, -20, -45);
        } else {
            this.body.setEnable(true);
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

        this.baseDepth = layerManager.getDepth('entities');
        this.updateDepth();

        this.setActive(true);
        this.setVisible(true);

        // 5. 모든 컴포넌트 준비 완료 후 외부 매니저(HUD, 그림자 등) 연결
        this.visual.attachManagers();

        // [신규] 컴뱃 매니저에 유닛 등록 (AOE 스킬 등이 탐색할 수 있도록)
        combatManager.addUnit(this);

        Logger.info("COMBAT_ENTITY", `Initialized ${this.logic.name} (Modular) at (${Math.round(this.x)}, ${Math.round(this.y)})`);

        // 6. 마우스 인터랙션 설정 (우클릭 정보창 확장)
        this.setupInteractions();
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

        this.setActive(false);
        this.setVisible(false);
        if (this.body) this.body.setEnable(false);

        // 비주얼 컴포넌트 정리 (Shadow, FX, Bobbing 중단)
        if (this.visual) this.visual.cleanup();

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

    // [신규] 구조적 분리로 인한 데이터 접근 브릿지
    get skillData() { return this.skills.skillData; }
    get ultData() { return this.skills.ultData; }

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
        this.combat.update(delta);
        this.skills.update(delta);
        this.visual.updateIdleState(); // 아이들 바빙 체크
    }

    gainUltimateCharge(points, applyMultiplier = true) {
        this.skills.gainUltimateCharge(points, applyMultiplier);
    }

    // [신규] 스킬 및 궁극기 실행 프록시
    isSkillReady(skillId) { return this.skills.isReady(skillId); }
    useSkill(skillId, target) { return this.skills.useSkill(skillId, target); }
    isUltimateReady() { return this.skills.isUltimateReady(); }
    useUltimate(target) { return this.skills.useUltimate(target); }

    preDestroy() {
        combatManager.removeUnit(this);
        if (this.visual) this.visual.cleanup();
        super.preDestroy();
    }
}
