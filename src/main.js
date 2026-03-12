import Phaser from 'phaser';

// ==========================================
// ⚔️ [Core] Game Configuration
// ==========================================

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#1a1a1a',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    // CRITICAL: Prevent the game and sound from pausing when minimized/blur
    audio: {
        disableWebAudio: false,
        noAudio: false,
        context: null,
        // phaser 3.16+ sound config
    },
    dom: {
        createContainer: true
    },
    // Background execution settings
    fps: {
        target: 60,
        forceSetTimeOut: true // Can help in background
    },
    callbacks: {
        postBoot: function (game) {
            // Ensure sound continues playing when focus is lost
            game.sound.pauseOnBlur = false;
        }
    },
    // scene: [BootScene, PreloadScene, TerritoryScene, DungeonScene]
    scene: {
        create: function() {
            console.log("⚔️ Messiah Grimoire: System Initialized.");
            this.add.text(640, 360, 'Messiah Grimoire\nRebooting...', {
                fontSize: '32px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            // Log for debugging (per user rule)
            console.log("[DEBUG] Background play enabled: sound.pauseOnBlur = false");
        }
    }
};

const game = new Phaser.Game(config);

export default game;
