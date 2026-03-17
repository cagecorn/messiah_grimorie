import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import Logger from '../../../utils/Logger.js';
import layerManager from '../../../ui/LayerManager.js';
import animationManager from '../../../systems/graphics/AnimationManager.js';

/**
 * 🌑 그림자 투사체 (Shadow Projectile)
 * 역할: [유닛을 그림자 형태로 변환하여 지면을 따라 이동시키는 특수 투사체]
 */
export default class ShadowProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'spirit_totem_sprite'); // 임시 에셋 (나중에 전용 검은 원 에셋으로 교체 가능)
        this.carriedUnit = null;
        this.onCompleteCallback = null;
    }

    /**
     * 그림자 이동 시작
     */
    launch(owner, target, config = {}) {
        this.carriedUnit = owner;
        this.onCompleteCallback = config.onComplete;
        
        // 투사체 설정 (지면에 붙어서 이동)
        config.isPierce = true;
        config.speed = config.speed || 400;
        
        // 1. 초기 위치 설정
        const startX = owner.x;
        const startY = owner.y;
        this.setPosition(startX, startY);

        // 2. 비주얼 설정 (검은색 틴트 및 반투명)
        if (this.sprite) {
            this.sprite.setTint(0x000000);
            this.sprite.setAlpha(0.7);
            this.sprite.setScale(0.8, 0.4); // 납작한 그림자 형태
        }

        // 3. 레이어 설정 (지면 효과 레이어)
        layerManager.assignToLayer(this, 'ground_fx');

        // 4. 부모 클래스 런칭
        const dummy = { x: startX, y: startY, team: owner.team, id: owner.id, logic: owner.logic };
        super.launch(dummy, target, config);

        // 5. 본체 숨기기 (애니메이션 매니저 연동)
        animationManager.playSinking(owner, 300, () => {
            Logger.info("SHADOW_PROJ", `${owner.logic.name} dove into shadows.`);
        });
    }

    /**
     * 목적지 도달 시
     */
    onHitGround() {
        if (!this.carriedUnit) return;

        const owner = this.carriedUnit;
        const finalX = this.x;
        const finalY = this.y;

        // 1. 본체 위치 이동 및 다시 나타나기 연출
        owner.setPosition(finalX, finalY);
        if (owner.body) owner.body.reset(finalX, finalY);

        animationManager.playEmerging(owner, 400, () => {
            Logger.info("SHADOW_PROJ", `${owner.logic.name} emerged from shadows.`);
            
            // 2. 콜백 실행 (기습 공격 등)
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
            }
            
            // 3. 투사체 소멸
            this.destroyProjectile();
        });
    }

    /**
     * 안전장치
     */
    destroyProjectile() {
        this.carriedUnit = null;
        super.destroyProjectile();
    }
}
