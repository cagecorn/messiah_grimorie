import Logger from '../utils/Logger.js';
import EventBus from './EventBus.js';

/**
 * 입력 라우터 (Input Router)
 * 역할: [라우터 (Router) & 입력 통합 허브]
 * 
 * 설명: 키보드와 마우스의 모든 생명 주기를 관리하고 명령을 배분합니다.
 * 하드코딩된 키 입력을 방지하고, 상황(Context)에 따라 입력을 UI로 보낼지, 
 * 월드로 보낼지 결정하는 제어 장치입니다.
 */
class InputRouter {
    constructor() {
        this.scene = null;
        this.keys = new Map();
        this.isInputEnabled = true;

        Logger.system("InputRouter: Initialized (User control hub ready).");
    }

    /**
     * 씬의 입력 시스템 연동
     */
    initialize(scene) {
        this.scene = scene;
        this.setupDefaultKeys();
        
        // 마우스 클릭 이벤트 라우팅
        this.scene.input.on('pointerdown', (pointer) => {
            if (!this.isInputEnabled) return;
            this.routePointerInput('down', pointer);
        });

        Logger.info("INPUT_ROUTER", "Input context bound to scene.");
    }

    /**
     * 기본 키 매핑 설정 (미래의 키 바인딩 설정을 고려)
     */
    setupDefaultKeys() {
        if (!this.scene) return;

        // 자주 쓰이는 키 등록
        const keysToRegister = {
            'UP': Phaser.Input.Keyboard.KeyCodes.W,
            'LEFT': Phaser.Input.Keyboard.KeyCodes.A,
            'DOWN': Phaser.Input.Keyboard.KeyCodes.S,
            'RIGHT': Phaser.Input.Keyboard.KeyCodes.D,
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE,
            'ESC': Phaser.Input.Keyboard.KeyCodes.ESC,
            'INVENTORY': Phaser.Input.Keyboard.KeyCodes.I,
            'MENU': Phaser.Input.Keyboard.KeyCodes.M
        };

        for (const [name, code] of Object.entries(keysToRegister)) {
            this.keys.set(name, this.scene.input.keyboard.addKey(code));
        }
    }

    /**
     * 입력을 전반적으로 멈추거나 재개 (컷씬 등)
     */
    setInputEnabled(enabled) {
        this.isInputEnabled = enabled;
        Logger.info("INPUT_ROUTER", `Global input ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    /**
     * 매 프레임 키 상태를 체크하고 이벤트를 라우팅
     */
    update() {
        if (!this.isInputEnabled || !this.scene) return;

        // 방향키 입력 라우팅
        const movement = { x: 0, y: 0 };
        if (this.keys.get('UP').isDown) movement.y -= 1;
        if (this.keys.get('DOWN').isDown) movement.y += 1;
        if (this.keys.get('LEFT').isDown) movement.x -= 1;
        if (this.keys.get('RIGHT').isDown) movement.x += 1;

        if (movement.x !== 0 || movement.y !== 0) {
            EventBus.emit('INPUT_MOVEMENT', movement);
        }

        // 단축키 입력 라우팅 (Just Down 체크)
        if (Phaser.Input.Keyboard.JustDown(this.keys.get('ESC'))) {
            EventBus.emit('INPUT_UI_COMMAND', 'CLOSE_ALL');
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.get('INVENTORY'))) {
            EventBus.emit('INPUT_UI_COMMAND', 'TOGGLE_INVENTORY');
        }
    }

    /**
     * 마우스/터치 입력 라우팅
     */
    routePointerInput(type, pointer) {
        // [TODO] 인터페이스 상단에 UI가 있다면 UI로, 아니면 월드 좌표로 변환하여 라우팅
        Logger.info("INPUT_ROUTER", `Pointer ${type} at: ${pointer.x}, ${pointer.y}`);
        EventBus.emit('INPUT_POINTER', { type, x: pointer.x, y: pointer.y, worldX: pointer.worldX, worldY: pointer.worldY });
    }
}

const inputRouter = new InputRouter();
export default inputRouter;
