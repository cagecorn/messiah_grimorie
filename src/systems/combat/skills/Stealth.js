import Logger from '../../../utils/Logger.js';

/**
 * 자인 전용 스킬: 은신 (Stealth)
 * 역할: [반투명화, 타겟팅 제외, 잔상 효과 활성화]
 */
const stealth = {
    id: 'stealth',
    name: 'Stealth',
    duration: 5000, // 5초 지속

    execute(attacker) {
        if (!attacker || !attacker.logic.isAlive) return false;

        Logger.info("SKILL", `[${attacker.logic.name}] uses Stealth!`);

        // 1. 시각적 효과 (반투명화 - 스프라이트 직접 제어)
        if (attacker.sprite) {
            attacker.sprite.setAlpha(0.4);
        } else {
            attacker.setAlpha(0.4);
        }

        // 2. 상태 부가 (Targeting 제외를 위한 플래그)
        if (!attacker.logic.status.states) {
            attacker.logic.status.states = {};
        }
        attacker.logic.status.states.stealthed = true;

        // 3. 고스트 매니저 연동 (잔상 효과 활성화 플래그)
        attacker.isStealthed = true;

        // 4. 버프 아이콘 및 타이머 설정
        const buffId = `stealth_${attacker.id}_${Date.now()}`;
        if (attacker.logic.buffs) {
            attacker.logic.buffs.addBuff({
                id: buffId,
                key: 'stealth',
                value: 0,
                type: 'add',
                duration: this.duration,
                icon: 'stealth'
            });
        }

        // 5. 종료 처리 (타이머)
        attacker.scene.time.delayedCall(this.duration, () => {
            if (attacker.active && attacker.logic.isAlive) {
                if (attacker.sprite) {
                    attacker.sprite.setAlpha(1.0);
                } else {
                    attacker.setAlpha(1.0);
                }
                attacker.logic.status.states.stealthed = false;
                attacker.isStealthed = false;
                Logger.info("SKILL", `[${attacker.logic.name}]'s Stealth has worn off.`);
            }
        });

        // 스킬 연출 (연기 등)
        if (attacker.scene.fxManager) {
            attacker.scene.fxManager.spawnExplosion(attacker.x, attacker.y, {
                scale: 0.5,
                tint: 0x333333
            });
        }

        return true;
    }
};

export default stealth;
