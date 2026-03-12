import Phaser from 'phaser';
import state from '../core/GlobalState.js';
import displayManager from '../core/DisplayManager.js';

/**
 * 메인 씬 (Main Scene)
 * 게임의 주요 화면을 담당하며 로컬라이제이션 및 리사이즈 테스트를 수행합니다.
 */
export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        // [구역 1] 배경 및 텍스트 설정
        this.bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x1a1a1a).setOrigin(0);

        // 중앙 정렬을 위해 displayManager 참조
        const center = displayManager.getCenter();

        this.titleText = this.add.text(center.x, center.y - 60, state.t('game_title'), {
            fontSize: '48px',
            fill: '#00fbff',
            align: 'center',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        this.statusText = this.add.text(center.x, center.y + 40, `Current Mode: ${state.t('focus_mode')}`, {
            fontSize: '24px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // 언어 변경 버튼
        this.btnKo = this.add.text(center.x - 100, center.y + 140, '[ KOREAN ]', { fill: '#ffff00', fontSize: '20px' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.changeLanguage('ko'));

        this.btnEn = this.add.text(center.x + 100, center.y + 140, '[ ENGLISH ]', { fill: '#ffff00', fontSize: '20px' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.changeLanguage('en'));

        // 리사이즈 이벤트 대응
        this.scale.on('resize', this.onResize, this);
        
        console.log("⚔️ MainScene: Resolution reactive mode enabled.");
    }

    onResize(gameSize) {
        const { width, height } = gameSize;
        const center = displayManager.getCenter();

        // 배경 리사이즈
        this.bg.setSize(width, height);

        // 텍스트 위치 재정렬
        this.titleText.setPosition(center.x, center.y - 60);
        this.statusText.setPosition(center.x, center.y + 40);
        this.btnKo.setPosition(center.x - 100, center.y + 140);
        this.btnEn.setPosition(center.x + 100, center.y + 140);
    }

    changeLanguage(lang) {
        state.setLanguage(lang);
        this.titleText.setText(state.t('game_title'));
        this.statusText.setText(`Current Mode: ${state.t('focus_mode')}`);
    }
}
