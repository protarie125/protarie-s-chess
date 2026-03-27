// Phaserゲーム設定
const isPortrait = window.innerHeight > window.innerWidth;

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: isPortrait ? 900 : 1600,
        height: isPortrait ? 1600 : 900,
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

