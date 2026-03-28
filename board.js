// チェス盤の設定
const BOARD_SIZE = 8;
const SQUARE_SIZE = 80;
const BOARD_PIXEL_SIZE = SQUARE_SIZE * BOARD_SIZE;
const LABEL_SIZE = 40;

// 無彩色（グレースケール）
const LIGHT_SQUARE = 0xE0E0E0;   // ライトグレー
const DARK_SQUARE = 0x808080;    // ダークグレー

let boardStartX, boardStartY;

function createBoard(scene) {
    const centerX = scene.cameras.main.centerX;
    const centerY = scene.cameras.main.centerY;
    
    boardStartX = centerX - BOARD_PIXEL_SIZE / 2;
    boardStartY = centerY - BOARD_PIXEL_SIZE / 2;
    
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const x = file * SQUARE_SIZE;
            const y = rank * SQUARE_SIZE;
            
            const isLight = (rank + file) % 2 === 0;
            const color = isLight ? LIGHT_SQUARE : DARK_SQUARE;
            
            graphics.fillStyle(color);
            graphics.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
            graphics.lineStyle(1, 0x666666, 0.2);
            graphics.strokeRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
        }
    }
    
    graphics.lineStyle(3, 0x666666);
    graphics.strokeRect(0, 0, BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE);
    
    graphics.generateTexture('boardTexture', BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE);
    graphics.destroy();
    
    scene.add.image(boardStartX + BOARD_PIXEL_SIZE / 2, boardStartY + BOARD_PIXEL_SIZE / 2, 'boardTexture');
    
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    for (let i = 0; i < 8; i++) {
        const x = boardStartX + i * SQUARE_SIZE + SQUARE_SIZE / 2;
        const y = boardStartY + BOARD_PIXEL_SIZE + LABEL_SIZE / 2;
        
        scene.add.text(x, y, files[i], {
            font: 'bold 16px Arial',
            fill: '#666666',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    for (let i = 0; i < 8; i++) {
        const x = boardStartX - LABEL_SIZE / 2;
        const y = boardStartY + (7 - i) * SQUARE_SIZE + SQUARE_SIZE / 2;
        
        scene.add.text(x, y, (i + 1).toString(), {
            font: 'bold 16px Arial',
            fill: '#666666',
            align: 'center'
        }).setOrigin(0.5);
    }
}

function setupClickEvents(scene) {
    scene.input.on('pointerdown', (pointer) => {
        const clickX = pointer.x;
        const clickY = pointer.y;

        if (clickX < boardStartX || clickX > boardStartX + BOARD_PIXEL_SIZE ||
            clickY < boardStartY || clickY > boardStartY + BOARD_PIXEL_SIZE) {
            return;
        }

        // 駒の上かどうか確認
        let clickedPiece = null;
        for (let piece of pieces) {
            const distance = Phaser.Math.Distance.Between(clickX, clickY, piece.x, piece.y);
            if (distance <= PIECE_BG_RADIUS) {
                clickedPiece = piece;
                break;
            }
        }

        if (clickedPiece) {
            if (selectedPiece && selectedPiece !== clickedPiece) {
                // 選択中に別の駒をクリック→相手駒なら移動、自駒なら選択替え
                const { file, rank } = clickedPiece.pieceData;
                movePiece(file, rank, scene); // 相手駒なら取る、自駒ならmovePiece内で弾かれる
                if (selectedPiece) { // movePieceで移動できなかった場合は選択替え
                    selectPiece(scene, clickedPiece);
                }
            } else if (selectedPiece === clickedPiece) {
                deselectPiece();
            } else {
                selectPiece(scene, clickedPiece);
            }
        } else {
            // 空きマスクリック
            const file = Math.floor((clickX - boardStartX) / SQUARE_SIZE);
            const rank = Math.floor((clickY - boardStartY) / SQUARE_SIZE);
            if (selectedPiece) {
                movePiece(file, rank, scene);
            }
        }
    });
}
