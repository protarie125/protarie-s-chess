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

async function askStockfish() {
    return;
    const fen = generateFEN();
    const url = 'https://stockfish.online/api/s/v2.php?fen=' + encodeURIComponent(fen) + '&depth=12';

    const response = await fetch(url);
    const data = await response.json();

    if (data.success && data.bestmove) {
        const move = data.bestmove.split(' ')[1];
        console.log('Stockfish move:', data.bestmove);
        executeStockfishMove(game.scene.scenes[0], move);
    }
}
