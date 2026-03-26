// 駒の設定
const PIECE_SIZE = 50;
const PIECE_BG_RADIUS = 28;

// チェスの初期配置
const initialBoard = [
    ['R', 'N', 'B', 'K', 'Q', 'B', 'N', 'R'],  // rank 8 (黒)
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],  // rank 7 (黒ポーン)
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],  // rank 2 (白ポーン)
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']   // rank 1 (白)
];

let pieces = [];

/**
 * 駒を作成する
 * @param {Phaser.Scene} scene - Phaserシーン
 * @param {number} file - ファイル（0-7）
 * @param {number} rank - ランク（0-7）
 * @param {string} type - 駒のタイプ（K, Q, R, B, N, P）
 * @param {boolean} isBlack - 黒いか白いか
 * @returns {Phaser.GameObjects.Container} - 駒のコンテナ
 */
function createPiece(scene, file, rank, type, isBlack) {
    const x = boardStartX + file * SQUARE_SIZE + SQUARE_SIZE / 2;
    const y = boardStartY + rank * SQUARE_SIZE + SQUARE_SIZE / 2;
    
    // 駒のコンテナを作成
    const pieceContainer = scene.add.container(x, y);
    
    // 丸い背景
    const bgColor = isBlack ? 0x333333 : 0xFFFFFF;
    const bgCircle = scene.add.circle(0, 0, PIECE_BG_RADIUS, bgColor);
    bgCircle.setStrokeStyle(2, 0x000000);
    
    // 駒の文字
    const textColor = isBlack ? '#FFFFFF' : '#000000';
    const pieceText = scene.add.text(0, 0, type, {
        font: 'bold 32px Arial',
        fill: textColor,
        align: 'center'
    }).setOrigin(0.5);
    
    pieceContainer.add(bgCircle);
    pieceContainer.add(pieceText);
    
    // 駒のデータを保持
    pieceContainer.pieceData = {
        file: file,
        rank: rank,
        type: type,
        isBlack: isBlack
    };
    
    // インタラクティブに
    pieceContainer.setInteractive(
        new Phaser.Geom.Circle(0, 0, PIECE_BG_RADIUS),
        Phaser.Geom.Circle.Contains
    );
    
    // マウスイベント
    scene.input.setDraggable(pieceContainer);
    
    pieces.push(pieceContainer);
    return pieceContainer;
}

/**
 * 駒をグリッドにスナップさせる
 * @param {Phaser.GameObjects.Container} piece - 駒のコンテナ
 */
function snapPieceToGrid(piece) {
    const x = piece.x;
    const y = piece.y;
    
    // 最近のファイルとランクを計算
    let file = Math.round((x - boardStartX - SQUARE_SIZE / 2) / SQUARE_SIZE);
    let rank = Math.round((y - boardStartY - SQUARE_SIZE / 2) / SQUARE_SIZE);
    
    // 範囲内に制限
    file = Phaser.Math.Clamp(file, 0, 7);
    rank = Phaser.Math.Clamp(rank, 0, 7);
    
    // グリッドにスナップ
    piece.x = boardStartX + file * SQUARE_SIZE + SQUARE_SIZE / 2;
    piece.y = boardStartY + rank * SQUARE_SIZE + SQUARE_SIZE / 2;
    
    // データを更新
    piece.pieceData.file = file;
    piece.pieceData.rank = rank;
}

/**
 * すべての駒を初期配置に追加する
 * @param {Phaser.Scene} scene - Phaserシーン
 */
function initializePieces(scene) {
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const piece = initialBoard[rank][file];
            if (piece) {
                const isBlack = rank < 2;
                createPiece(scene, file, rank, piece, isBlack);
            }
        }
    }
}

/**
 * 駒のドラッグイベントをセットアップする
 * @param {Phaser.Scene} scene - Phaserシーン
 */
function setupPieceDragEvents(scene) {
    // ドラッグイベント
    scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });
    
    // ドラッグ終了イベント
    scene.input.on('dragend', (pointer, gameObject) => {
        snapPieceToGrid(gameObject);
    });
}
