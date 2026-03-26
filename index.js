// Phaserゲーム設定
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1600,
        height: 900,
        expandParent: true,
        fullscreenTarget: 'game-container',
        resizeInterval: 100
    },
    scene: {
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

/**
 * シーン作成時の処理
 */
function create() {
    // チェス盤を作成
    createBoard(this);
    
    // 駒を初期配置
    initializePieces(this);
    
    // 駒のドラッグイベントをセットアップ
    setupPieceDragEvents(this);
}

/**
 * 毎フレーム実行される処理
 */
function update() {
    // ゲームループ
}

