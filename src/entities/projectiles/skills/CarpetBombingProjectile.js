import Phaser from 'phaser';

/**
 * 융단폭격 비행기 투사체 (Carpet Bombing Plane Projectile)
 * 역할: [화면 상단을 가로지르며 일정 간격으로 미사일을 투하]
 */
export default class CarpetBombingProjectile extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);

        this.owner = null;
        this.active = false;
        this.speed = 800; 
        this.direction = 1; // 1: Right, -1: Left
        
        // 비행기 스프라이트 설정
        this.planeSprite = scene.add.sprite(0, 0, 'carpet_bombing_projectile');
        this.planeSprite.setOrigin(0.5, 0.5);
        this.planeSprite.setScale(1.5);
        this.add(this.planeSprite);

        // 물리 바디 설정 (이동용)
        scene.physics.add.existing(this);
        if (this.body) {
            this.body.setAllowGravity(false);
            this.body.setImmovable(true);
        }

        // 폭격 관련 변수
        this.bombingTimer = 0;
        this.bombInterval = 150; // 0.15초마다 하나씩 투하
        this.bombsRemaining = 12; // 총 12발 투하
        this.targetX = 0;
        this.targetY = 0;
        this.damageMultiplier = 1.0;
    }

    /**
     * 발사 초기화
     */
    launch(owner, target, config = {}) {
        this.owner = owner;
        this.active = true;
        this.setVisible(true);
        
        this.targetX = config.targetX || 1000;
        this.targetY = config.targetY || 500;
        this.damageMultiplier = config.multiplier || 4.5;
        
        // 화면 밖에서 시작하도록 설정
        const camera = this.scene.cameras.main;
        const worldView = camera.worldView;
        const margin = 200;

        // 시전자의 방향에 따라 시작 위치 결정 (또는 타겟 지점 기준으로 결정)
        // 여기서는 시전자의 flipX를 기준으로 함
        this.direction = owner.flipX ? -1 : 1;
        
        const startX = (this.direction === 1) ? worldView.x - margin : worldView.right + margin;
        // 비행기는 하늘 높이(지면 대비 -500~-600) 위치
        const startY = Math.min(this.targetY - 600, worldView.y + 100);

        this.setPosition(startX, startY);
        this.planeSprite.setFlipX(this.direction === -1);

        if (this.body) {
            this.body.setVelocityX(this.speed * this.direction);
        }

        this.bombingTimer = 0;
        this.bombsRemaining = 12;

        // 화면 밖으로 나가면 자동 파괴
        const travelTime = (worldView.width + margin * 3) / (this.speed / 1000);
        this.scene.time.delayedCall(travelTime, () => {
            if (this.active) this.destroyProjectile();
        });
    }

    update(time, delta) {
        if (!this.active) return;

        // 폭격 로직
        if (this.bombsRemaining > 0) {
            this.bombingTimer += delta;
            
            // 타겟 지점 반경 400px 내에 있을 때부터 폭격 시작
            const distToCenter = Math.abs(this.x - this.targetX);
            if (distToCenter < 500) {
                if (this.bombingTimer >= this.bombInterval) {
                    this.dropMissile();
                    this.bombingTimer = 0;
                    this.bombsRemaining--;
                }
            }
        }
    }

    dropMissile() {
        if (!this.scene.projectileManager) return;

        // 미사일 투하 (간격에 맞춰 약간의 위치 분산)
        const spread = 40;
        const missileX = this.x + (Math.random() - 0.5) * spread;
        const missileY = this.y + 20;

        // 미사일의 목표 지점 (비행기 진행 방향에 따라 순차적으로 폭격)
        // 비행기 좌표 + 약간의 오프셋을 바닥 Y좌표로 투하
        this.scene.projectileManager.fire('carpet_bombing_missile', this.owner, null, {
            startX: missileX,
            startY: missileY,
            targetX: missileX + (this.direction * 100), // 약간 앞으로 날아가는 느낌
            targetY: this.targetY + (Math.random() - 0.5) * 100, // Y축 분산
            multiplier: this.damageMultiplier / 12 // 미사일 개수로 데미지 분할
        });

        // 투하 사운드 (선택적)
        if (this.scene.sound && Math.random() > 0.7) {
            // this.scene.sound.play('missile_drop', { volume: 0.3 });
        }
    }

    destroyProjectile() {
        this.active = false;
        if (this.scene.projectileManager) {
            this.scene.projectileManager.release(this);
        } else {
            this.destroy();
        }
    }
}
