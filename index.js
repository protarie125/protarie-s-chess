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

let chessBoard;

function create() {
    // 画面中央に800x800の四角形を描画
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    chessBoard = this.add.rectangle(
        centerX,
        centerY,
        800,
        800,
        0x8b7355
    );
    chessBoard.setStrokeStyle(2, 0xffffff);
}

function update() {
    // ゲームループ
}
