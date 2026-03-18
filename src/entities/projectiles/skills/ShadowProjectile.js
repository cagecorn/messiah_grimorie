import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import Logger from '../../../utils/Logger.js';
import layerManager from '../../../ui/LayerManager.js';
import animationManager from '../../../systems/graphics/AnimationManager.js';
import shadowInstanceManager from '../../../systems/graphics/ShadowInstanceManager.js';
import measurementManager from '../../../core/MeasurementManager.js';
import Dummy from '../../Dummy.js';

/**
 * 🌑 그림자 투사체 (Shadow Projectile)
 * 역할: [유닛을 그림자 형태로 변환하여 지면을 따라 이동시키는 특수 투사체]
 */
export default class ShadowProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'spirit_totem_sprite'); 
        this.carriedUnit = null;
        this.onCompleteCallback = null;
    }

    /**
     * 투사체 초기 설정 (이동 없이 대기)
     */
    launch(owner, target, config = {}) {
        this.carriedUnit = owner;
        this.onCompleteCallback = config.onComplete;
        this.moveSpeed = config.speed || 600;
        this.canHit = false; // [FIX] 가라앉기(Sinking) 단계에서는 충돌 무시

        // [신규] 카메라 추적을 위한 가상 실체화 (Dummy 유틸리티 활용)
        this.team = 'mercenary';
        this.logic = Dummy.createLogic(`shadow_logic_${owner.id}`, "Shadow");
        Dummy.applyMethods(this);

        // [신규] 씬의 아군 리스트에 등록 (카메라 매니저가 이 리스트를 보고 추적함)
        if (this.scene.allies && !this.scene.allies.includes(this)) {
            this.scene.allies.push(this);
            Logger.debug("SHADOW_PROJ", "Registered to allies for camera tracking.");
        }
        
        // [FIX] 1. 월드 경계 제한 (화면 밖으로 나가지 않도록 보정)
        const world = measurementManager.world;
        const rawTargetX = (target && target.x !== undefined) ? target.x : (config.targetPos ? config.targetPos.x : owner.x);
        const rawTargetY = (target && target.y !== undefined) ? target.y : (config.targetPos ? config.targetPos.y : owner.y);
        
        const targetX = Phaser.Math.Clamp(rawTargetX, 50, world.width - 50);
        const targetY = Phaser.Math.Clamp(rawTargetY, 50, world.height - 50);
        const clampedTarget = { x: targetX, y: targetY };

        // [FIX] 2. 적과 부딪히면 즉시 출현해야 하므로 Piercing 해제
        config.isPierce = false;
        
        const startX = owner.x;
        const startY = owner.y;

        this.setPosition(startX, startY);
        this.setVisible(false);

        // 부모 설정 (이동 속도 0으로 시작)
        const dummy = { x: startX, y: startY + 40, team: owner.team, id: owner.id, logic: owner.logic, zHeight: 0 };
        super.launch(dummy, clampedTarget, { ...config, speed: 0 });
        this.setPosition(startX, startY);

        // 비주얼 설정 (바이퍼 스프라이트 활용)
        if (this.mainSprite && owner.sprite) {
            this.mainSprite.setTexture(owner.sprite.texture.key);
            this.mainSprite.setTint(0x000000);
            this.mainSprite.setAlpha(0.7);
            this.mainSprite.setScale(0.8, 0.2); 
            this.mainSprite.setOrigin(0.5, 1.0);
        }

        const instanceId = shadowInstanceManager.register(this, { type: 'shadow_projectile' });
        this.shadowInstanceId = instanceId;

        layerManager.assignToLayer(this, 'ground_fx');
    }

    get sprite() { return this.mainSprite; }
    isInvincible() { return true; }
    
    /**
     * 본체 컨테이너 탑승 (SinkingNode에서 호출)
     */
    containerize() {
        if (!this.carriedUnit) return;
        const owner = this.carriedUnit;

        Logger.debug("SHADOW_PROJ", `Containerizing ${owner.logic.name}`);
        
        this.add(owner);
        owner.setPosition(0, 0); 
        owner.isBeingCarried = true;
        
        if (owner.body) {
            owner.body.setEnable(false);
        }

        if (owner.sprite) {
            owner.sprite.setVisible(false);
        }

        this.setVisible(true);
    }

    /**
     * 대쉬 시작 (ShadowDashNode에서 호출)
     */
    startDash() {
        this.speed = this.moveSpeed;
        this.canHit = true; // [FIX] 대쉬 시작 시점부터 충돌 허용
        Logger.debug("SHADOW_PROJ", "Shadow dash started.");
    }

    /**
     * 목적지 도달 시 (ShadowDashNode -> EmergingNode 연동용)
     */
    onHitGround() {
        Logger.info("SHADOW_PROJ", `Shadow projectile reached destination. triggering onComplete.`);
        if (this.onCompleteCallback) {
            this.onCompleteCallback(this);
            this.onCompleteCallback = null; // 중복 호출 방지
        }
    }

    /**
     * 적과 충돌 시 (Phase 2 -> 3 즉시 전이)
     */
    onHit(target) {
        if (!this.canHit) return; // [FIX] 가라앉는 도중 충돌 무시

        Logger.info("SHADOW_PROJ", `Shadow projectile hit enemy ${target.logic.name}. Switching to phase 3.`);
        // [FIX] 적과 부딪혀도 hitGround(지면 도달)와 동일하게 처리하여 즉시 출현 유도
        this.hitGround();
    }

    /**
     * 본체 해제 (EmergingNode에서 호출)
     */
    releaseUnit() {
        if (!this.carriedUnit) return;
        const owner = this.carriedUnit;
        
        const finalX = this.x;
        const finalY = this.y;

        this.setVisible(false);
        this.remove(owner);
        this.scene.add.existing(owner);
        owner.setPosition(finalX, finalY);
        owner.isBeingCarried = false;

        // [FIX] 실종 방지: 해제 시 즉시 가시성 확보 (애니메이션 노드에서 다시 제어하더라도 기본적으로 보여야 함)
        owner.setVisible(true);
        if (owner.sprite) owner.sprite.setVisible(true);

        if (owner.body) {
            owner.body.setEnable(true);
            owner.body.reset(finalX, finalY);
        }

        this.carriedUnit = null;
        return owner;
    }

    destroyProjectile() {
        // [신규] 인스턴스 해제
        if (this.shadowInstanceId) {
            shadowInstanceManager.unregister(this.shadowInstanceId);
        }

        // 만약 유닛이 여전히 탑승 중이면 강제 해제 (안전장치 & 중단 대응)
        if (this.carriedUnit && this.carriedUnit.isBeingCarried) {
            const unit = this.releaseUnit();
            if (unit) {
                // [중단 대응] 비정상 종료 시 상태 복구
                if (unit.status && unit.status.states) {
                    unit.status.states.invincible = false;
                }
                unit.isBusy = false;
                if (unit.sprite) unit.sprite.setVisible(true);
                Logger.warn("SHADOW_PROJ", `Shadow dive interrupted for ${unit.logic.name}. State recovered.`);
            }
        }
        // [신규] 아군 리스트에서 제거 (추적 종료)
        if (this.scene.allies) {
            this.scene.allies = this.scene.allies.filter(a => a !== this);
        }

        super.destroyProjectile();
    }

    updateAttackCooldown() {
        // 대기 시간 없음
    }
}
