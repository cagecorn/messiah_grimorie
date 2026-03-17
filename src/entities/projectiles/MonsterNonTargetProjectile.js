import Phaser from 'phaser';
import Logger from './NonTargetProjectile.js'; // 실제로는 부모 클래스에서 import 하므로 경로 주의
import NonTargetProjectile from './NonTargetProjectile.js';
import monsterPatternAnimationManager from '../../systems/graphics/MonsterPatternAnimationManager.js';

/**
 * 몬스터 논타겟 투사체 (Monster Non-Target Projectile)
 * 역할: [들려있는 몬스터를 태워서 던지는 컨테이너형 투사체]
 */
export default class MonsterNonTargetProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        // 텍스트 없이 생성
        super(scene, x, y, null);
        this.carriedEntity = null;
    }

    /**
     * 투사체 발사 초기화 (몬스터 탑승)
     */
    launch(owner, target, config = {}) {
        super.launch(owner, target, config);
        
        if (config.carriedEntity) {
            this.carriedEntity = config.carriedEntity;
            // 투사체 내부가 아니라 씬 레벨에서 좌표만 동기화함 (좌표계 꼬임 방지)
            this.carriedEntity.isBeingCarried = true;
            this.updateCarriedPosition(16.6); // 초기 프레임 보정
        }
    }

    update(time, delta) {
        super.update(time, delta);
        this.updateCarriedPosition(delta);
    }

    updateCarriedPosition(delta) {
        if (this.carriedEntity && this.carriedEntity.active) {
            // 투사체 위치에 몬스터 고정
            this.carriedEntity.setPosition(this.x, this.y);
            this.carriedEntity.setDepth(this.depth + 1);

            // [ENHANCED] 투사된 몬스터는 360도로 빙글빙글 회전
            if (this.carriedEntity.visual && this.carriedEntity.visual.sprite) {
                const rotationSpeed = 720; // 초당 2바퀴
                this.carriedEntity.visual.sprite.angle += rotationSpeed * (delta / 1000);
            }
        }
    }

    /**
     * 목표 지점 도달 시폭발
     */
    explode() {
        if (this.config && this.config.onImpact) {
            this.config.onImpact(this.owner, this, { x: this.x, y: this.y });
        }
        
        // 투사체 제거 전 몬스터 상태 복구
        if (this.carriedEntity) {
            // 회전 초기화
            if (this.carriedEntity.visual && this.carriedEntity.visual.sprite) {
                this.carriedEntity.visual.sprite.setAngle(0);
            }
            this.carriedEntity.isBeingCarried = false;
            this.carriedEntity = null;
        }

        super.explode();
    }
}
