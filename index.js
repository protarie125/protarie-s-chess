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
    setupClickEvents(this);
    setupPieceDragEvents(this);

    // デバッグ表示
    const turnText = this.add.text(16, 16, 'Turn: White', {
        font: 'bold 18px Arial',
        fill: '#FFFFFF'
    });

    this.events.on('update', () => {
        turnText.setText('Turn: ' + (isWhiteTurn ? 'White' : 'Black') +
            (isInCheck(!isWhiteTurn) ? '  CHECK!' : ''));
    });
}

function update() {
}

