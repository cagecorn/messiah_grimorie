import Phaser from 'phaser';
import TargetProjectile from '../TargetProjectile.js';
import projectileManager from '../../../systems/combat/ProjectileManager.js';
import { BUFF_VALUES } from '../../../core/TechnicalConstants.js';

/**
 * 속사 투사체 컨테이너 (Rapid Fire Projectile Container)
 * 역할: [단일 투사체로 발사되어 내부적으로 5발의 투사체를 순차적으로 복제/발사]
 * 
 * 설명: 술자는 이 컨테이너 하나만 발사하며, 
 * 이 컨테이너가 설정된 간격(INTERVAL)에 따라 실제 데미지를 입히는 투사체들을 생성합니다.
 */
export default class RapidFireProjectile extends TargetProjectile {
    constructor(scene, x, y) {
        // 컨테이너 자체는 투명하게 생성 (자식들이 실제 투사체)
        super(scene, x, y, null);
    }

    /**
     * 발사 시퀀스 시작
     */
    onLaunch(config) {
        const originalType = config.originalType || 'melee';
        const { SHOT_COUNT, INTERVAL } = BUFF_VALUES.RAPID_FIRE;
        
        // 컨테이너 자체는 보이지 않게 처리 (자식들이 실제 투사체)
        this.setVisible(false);
        this.setActive(true);

        // 정해진 횟수만큼 실제 투사체 생성 및 발사
        let shotsCompleted = 0;
        for (let i = 0; i < SHOT_COUNT; i++) {
            this.scene.time.delayedCall(i * INTERVAL, () => {
                // 시전자나 타겟이 여전히 유효한지 확인
                if (this.owner && this.owner.active && this.target && this.target.active) {
                    const proj = projectileManager.fire(originalType, this.owner, this.target, {
                        damageMultiplier: this.damageMultiplier,
                        damageType: this.damageType
                    });
                    
                    if (proj) {
                        // 시전자의 최신 위치(또는 컨테이너 위치)에서 발사
                        proj.setPosition(this.owner.x, this.owner.y - 40);
                    }
                }
                
                shotsCompleted++;
                // 마지막 발사가 완료되면 컨테이너 해제
                if (shotsCompleted === SHOT_COUNT) {
                    this.destroyProjectile();
                }
            });
        }
    }

    // 컨테이너 자체는 업데이트 로직이 필요 없음 (자식들이 각자 비행함)
    update(time, delta) {}
}
