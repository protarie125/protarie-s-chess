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
    console.log('FEN:', generateFEN());
    
    const fen = generateFEN();
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5秒でタイムアウト
    
    try {
        const response = await fetch('https://chess-api.com/v1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fen: fen }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        const data = await response.json();

        console.log('Stockfish response:', data);

        if (data.move) {
            console.log('Stockfish move:', data.move);
            executeStockfishMove(game.scene.scenes[0], data.move);
        }
    } catch (e) {
        clearTimeout(timeout);
        console.log('Stockfish timeout or error:', e.message);
    }
}
