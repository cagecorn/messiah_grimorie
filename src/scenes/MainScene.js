import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        this.add.text(640, 360, '메시아 그리모어\n(테스트 빌드)', {
            fontSize: '48px',
            fill: '#00fbff',
            align: 'center',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        this.add.text(640, 450, '백그라운드에서 실행 중\n(음악 및 로직 유지 확인용)', {
            fontSize: '24px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }
}
