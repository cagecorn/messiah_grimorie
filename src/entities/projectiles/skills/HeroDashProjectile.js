import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import Logger from '../../../utils/Logger.js';
import layerManager from '../../../ui/LayerManager.js';
import ghostManager from '../../../systems/graphics/GhostManager.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';
import Airborne from '../../../systems/combat/effects/Airborne.js';

/**
 * 🚀 히어로 돌진 투사체 (Hero Dash Projectile)
 * 역할: [유닛 자신을 투사체 컨테이너에 태워 날려보내는 특수 시스템]
 * 
 * 🦖 [개발자 노트: 갓 오브젝트와 컨테이너 사이에서 살아남는 3가지 비기]
 * 1. 월드 좌표의 보존 (Dummy Initialization):
 *    Phaser 컨테이너에 유닛을 add하는 순간 유닛의 x,y는 상대 좌표(0,0)가 됩니다. 
 *    이때 super.launch를 호출하면 투사체가 0,0에서 시작하는 '텔레포트 버그'가 발생합니다.
 *    반드시 출발지의 절대 좌표를 백업하고, 가상 객체(Dummy)로 부모 클래스를 속여서 초기화해야 합니다.
 * 
 * 2. 관통 모드의 강제 (Forced Pierce):
 *    유닛이 타고 있는 투사체는 적과 부딪혔다고 해서 도중에 사라지면 안 됩니다 (유닛이 실종됨).
 *    isPierce를 true로 강제하여 목적지까지 유닛을 안전하게 '배달'하는 것이 핵심입니다.
 * 
 * 3. 이중 안전장치 (Emergency Release):
 *    어떤 알 수 없는 이유로 투사체 오브젝트가 destroy될 경우, 갇혀있던 유닛은 씬에서 영원히 사라집니다.
 *    destroyProjectile을 오버라이드하여, 소멸 직전 유닛이 남아있다면 즉시 지면에 내려놓아야 합니다.
 */
export default class HeroDashProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, null);
        this.carriedUnit = null;
        this.onCompleteCallback = null;
        this.config = {}; // 발사 설정 백업

        // [신규] 돌진 잔상 및 이펙트용 스프라이트 (컨테이너가 아닌 씬에 직접 추가하여 고정)
        this.dashSprite = scene.add.image(0, 0, 'charge_attack');
        this.dashSprite.setVisible(false);
        
        this.ghostTimer = null;
    }

    /**
     * 유닛을 태우고 돌진 시작
     */
    launch(owner, target, config = {}) {
        this.carriedUnit = owner;
        this.config = config; // 설정 저장
        owner.isBeingCarried = true;
        this.onCompleteCallback = config.onComplete;
        
        // [중요] 부모 컨테이너가 바뀌기 전의 절대 좌표 백업 및 즉시 적용
        const startX = owner.x;
        const startY = owner.y;
        this.setPosition(startX, startY);

        // 1. 유닛 본체를 컨테이너 자식으로 편입 (좌표는 0,0 고정)
        this.add(owner);
        owner.setPosition(0, 0); 
        
        if (owner.body) {
            owner.body.setEnable(false);
        }

        // 2. 부모 클래스 초기화
        config.isPierce = true; 
        
        const dummy = { x: startX, y: startY + 40, team: owner.team, id: owner.id, logic: owner.logic };
        super.launch(dummy, target, config);
        
        this.owner = owner;
        this.setPosition(startX, startY);

        // 3. [수정] 시각적 연출 설정 (출발지에 고정)
        const dist = Phaser.Math.Distance.Between(startX, startY, this.targetPos.x, this.targetPos.y);
        const angle = Phaser.Math.Angle.Between(startX, startY, this.targetPos.x, this.targetPos.y);

        if (config.effectKey) {
            this.dashSprite.setTexture(config.effectKey);
            this.dashSprite.setPosition(startX, startY); // 씬 기준 절대 좌표
            this.dashSprite.setVisible(true);
            this.dashSprite.setAlpha(0.8);
            this.dashSprite.setOrigin(0, 0.5); // 왼쪽 끝 고정
            this.dashSprite.setRotation(angle);
            this.dashSprite.setDisplaySize(dist, 320); // 도착지까지 늘리기
            this.dashSprite.setBlendMode(Phaser.BlendModes.ADD);
            this.dashSprite.setDepth(owner.depth - 1);
        }
 else {
            this.dashSprite.setVisible(false);
        }

        // 잔상 효과 (Ghosting) - 유닛이 아닌 컨테이너 위치 기반으로 생성
        if (this.ghostTimer) this.ghostTimer.remove();
        this.ghostTimer = this.scene.time.addEvent({
            delay: 35,
            loop: true,
            callback: () => {
                if (!this.active || !this.carriedUnit) return;
                // [수정] 유닛 본체가 0,0에 있으므로 직접 위치를 찍어서 생성함
                ghostManager.spawnGhost(owner, { 
                    lifeTime: 300, 
                    tint: 0x00ffff, 
                    alpha: 0.5,
                    x: this.x,
                    y: this.y 
                });
                if (phaserParticleManager.spawnWhiteDust) phaserParticleManager.spawnWhiteDust(this.x, this.y);
            }
        });

        Logger.info("HERO_PROJ_DEBUG", `Launch Complete: (${this.x.toFixed(1)}, ${this.y.toFixed(1)})`);
    }

    /**
     * 프레임 업데이트 로그 추가
     */
    onUpdate(time, delta) {
        super.onUpdate(time, delta); // 부모 클래스의 onUpdate 호출
        if (this.active && this.carriedUnit && this.scene.time.now % 500 < 20) { // 0.5초마다 출력
            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
            Logger.info("HERO_PROJ_DEBUG", `Flying... Pos: (${this.x.toFixed(1)}, ${this.y.toFixed(1)}), Dist to go: ${dist.toFixed(1)}`);
        }
    }

    /**
     * 경로상 충돌 시 (NonTargetProjectile.hit에서 호출됨)
     */
    onHit(target) {
        Logger.info("HERO_PROJ", `Dash hit: ${target.logic.name}`);
        
        // [신규] 경로상 적들에게도 에어본 적용 옵션
        if (this.config.airborneOnHit) {
            Logger.info("HERO_PROJ_DEBUG", `Applying Airborne to path target: ${target.logic.name}`);
            Airborne.apply(target, this.config.airborneDuration || 800, 100, this.owner);
        }
    }

    /**
     * 목표 지점 도달 시
     */
    onHitGround() {
        if (!this.carriedUnit) return;

        const owner = this.carriedUnit;
        const finalX = this.x;
        const finalY = this.y;
        Logger.info("HERO_PROJ_DEBUG", `Arrived at Ground: (${finalX.toFixed(1)}, ${finalY.toFixed(1)})`);

        // 1. 유닛 복귀 및 가시성 강제 초기화
        this.remove(owner);
        this.scene.add.existing(owner);
        owner.setPosition(finalX, finalY);
        owner.alpha = 1;
        owner.setVisible(true);
        
        this.scene.tweens.killTweensOf(owner);
        if (owner.sprite) {
            this.scene.tweens.killTweensOf(owner.sprite);
            owner.sprite.setAlpha(1);
            owner.sprite.setAngle(0);
            owner.sprite.setPosition(0, 0);
            owner.sprite.setScale(owner.getEntityConfig().displayScale);
        }

        owner.setRotation(0);
        owner.isBeingCarried = false; 

        if (owner.body) {
            owner.body.setEnable(true);
            owner.body.reset(finalX, finalY);
        }

        Logger.info("HERO_PROJ_DEBUG", `Unit Re-integrated: ${owner.logic.name} at (${owner.x.toFixed(1)}, ${owner.y.toFixed(1)})`);
        Logger.info("HERO_PROJ", `${owner.logic.name} arrived at destination.`);

        // 2. 콜백 실행
        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }

        // 4. [신규] 시각 효과 정리
        if (this.dashSprite) {
            this.scene.tweens.add({
                targets: this.dashSprite,
                alpha: 0,
                scaleY: 0,
                duration: 300,
                onComplete: () => this.dashSprite.setVisible(false)
            });
        }
        // 투사체 소멸
        this.carriedUnit = null;
    }

    /**
     * 안전장치: 어떤 이유로든 투사체가 소멸될 때 유닛이 갇혀있으면 꺼내줌
     */
    destroyProjectile() {
        if (this.carriedUnit) {
            Logger.warn("HERO_PROJ", `Emergency release for ${this.carriedUnit.logic.name}`);
            this.onHitGround(); // 정상 착지 로직 재사용
        }
        super.destroyProjectile();
    }
}
