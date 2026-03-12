import Phaser from 'phaser';
import state from '../core/GlobalState.js';

/**
 * 메인 씬 (Main Scene)
 * 게임의 주요 화면을 담당하며 로컬라이제이션 테스트를 수행합니다.
 */
export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        // [구역 1] 배경 및 텍스트 설정
        this.add.rectangle(640, 360, 1280, 720, 0x1a1a1a);

        // 로컬라이제이션 적용 테스트
        this.titleText = this.add.text(640, 300, state.t('game_title'), {
            fontSize: '48px',
            fill: '#00fbff',
            align: 'center',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        this.statusText = this.add.text(640, 400, `Current Mode: ${state.t('focus_mode')}`, {
            fontSize: '24px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // 언어 변경 버튼 (테스트용)
        const btnKo = this.add.text(540, 500, '[ KOREAN ]', { fill: '#ffff00', fontSize: '20px' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.changeLanguage('ko'));

        const btnEn = this.add.text(740, 500, '[ ENGLISH ]', { fill: '#ffff00', fontSize: '20px' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.changeLanguage('en'));

        console.log("⚔️ MainScene: Localization testing ready.");
    }

    changeLanguage(lang) {
        state.setLanguage(lang);
        // 텍스트 즉시 갱신
        this.titleText.setText(state.t('game_title'));
        this.statusText.setText(`Current Mode: ${state.t('focus_mode')}`);
        
        console.log(`[DEBUG] Language switched to ${lang} in MainScene.`);
    }
}
