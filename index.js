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

function create() {
    createBoard(this);
    initializePieces(this);
    updateBoardState();
    setupPieceClickEvents(this);
    setupPieceDragEvents(this);
    setupSquareClickEvents(this);
}

function update() {
}

