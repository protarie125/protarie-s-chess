// 駒の設定
const PIECE_SIZE = 50;
const PIECE_BG_RADIUS = 28;

// チェスの初期配置
const initialBoard = [
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],  // rank 8 (黒)
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],  // rank 7 (黒ポーン)
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],  // rank 2 (白ポーン)
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']   // rank 1 (白)
];

let pieces = [];
let selectedPiece = null;
let highlightedSquares = [];
let boardState = [];
let lastMove = null; // 直前のムーブ情報（en passant用）
let isWhiteTurn = true;

function updateBoardState() {
    boardState = Array.from({ length: 8 }, () => Array(8).fill(null));

    pieces.forEach(piece => {
        const { file, rank, type, isBlack } = piece.pieceData;
        boardState[rank][file] = {
            type: type,
            isBlack: isBlack,
            piece: piece
        };
    });
}

function isPawnMoveLegal(fromFile, fromRank, toFile, toRank, isBlack) {
    const direction = isBlack ? 1 : -1; // 黒は下へ、白は上へ
    const initialRank = isBlack ? 1 : 6;

    const fileDiff = Math.abs(toFile - fromFile);
    const rankDiff = toRank - fromRank;

    if (toFile === fromFile && rankDiff === direction && !boardState[toRank][toFile]) {
        return true;
    }

    if (fromRank === initialRank && rankDiff === direction * 2 && toFile === fromFile &&
        !boardState[fromRank + direction][fromFile] && !boardState[toRank][toFile]) {
        return true;
    }

    if (fileDiff === 1 && rankDiff === direction) {
        const targetSquare = boardState[toRank][toFile];
        if (targetSquare && targetSquare.isBlack !== isBlack) {
            return true;
        }
    }

    if (fileDiff === 1 && rankDiff === direction && !boardState[toRank][toFile]) {
        const adjacentSquare = boardState[fromRank][toFile];
        if (adjacentSquare && adjacentSquare.type === 'P' && adjacentSquare.isBlack !== isBlack) {
            if (lastMove &&
                lastMove.piece === adjacentSquare.piece &&
                lastMove.fromRank === fromRank + direction * 2 &&
                lastMove.toRank === fromRank) {
                return true;
            }
        }
    }

    return false;
}

function isKnightMoveLegal(fromFile, fromRank, toFile, toRank) {
    const fileDiff = Math.abs(toFile - fromFile);
    const rankDiff = Math.abs(toRank - fromRank);
    return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
}

function isBishopMoveLegal(fromFile, fromRank, toFile, toRank) {
    const fileDiff = Math.abs(toFile - fromFile);
    const rankDiff = Math.abs(toRank - fromRank);

    if (fileDiff !== rankDiff) return false;

    const fileDir = toFile > fromFile ? 1 : -1;
    const rankDir = toRank > fromRank ? 1 : -1;

    let currentFile = fromFile + fileDir;
    let currentRank = fromRank + rankDir;

    while (currentFile !== toFile) {
        if (boardState[currentRank][currentFile]) return false;
        currentFile += fileDir;
        currentRank += rankDir;
    }

    return true;
}

function isRookMoveLegal(fromFile, fromRank, toFile, toRank) {
    if (fromFile !== toFile && fromRank !== toRank) return false;

    if (fromFile === toFile) {
        const rankDir = toRank > fromRank ? 1 : -1;
        for (let r = fromRank + rankDir; r !== toRank; r += rankDir) {
            if (boardState[r][fromFile]) return false;
        }
    } else {
        const fileDir = toFile > fromFile ? 1 : -1;
        for (let f = fromFile + fileDir; f !== toFile; f += fileDir) {
            if (boardState[fromRank][f]) return false;
        }
    }

    return true;
}

function isQueenMoveLegal(fromFile, fromRank, toFile, toRank) {
    return isBishopMoveLegal(fromFile, fromRank, toFile, toRank) ||
        isRookMoveLegal(fromFile, fromRank, toFile, toRank);
}

function isKingMoveLegal(fromFile, fromRank, toFile, toRank, isBlack) {
    const fileDiff = toFile - fromFile;
    const rankDiff = Math.abs(toRank - fromRank);

    // 通常の1マス移動
    if (Math.abs(fileDiff) <= 1 && rankDiff <= 1 && !(fileDiff === 0 && rankDiff === 0)) {
        return !isInCheck_afterMove(fromFile, fromRank, toFile, toRank, isBlack);
    }

    // キャスリング
    const kingSquare = boardState[fromRank][fromFile];
    if (!kingSquare || kingSquare.piece.pieceData.hasMoved) return false;
    if (rankDiff !== 0) return false;

    // キングサイド（右、file+2）
    if (fileDiff === 2) {
        const rook = boardState[fromRank][7];
        if (!rook || rook.type !== 'R' || rook.piece.pieceData.hasMoved) return false;
        if (boardState[fromRank][5] || boardState[fromRank][6]) return false;
        if (isInCheck(isBlack)) return false;
        if (isInCheck_afterMove(fromFile, fromRank, fromFile + 1, fromRank, isBlack)) return false;
        if (isInCheck_afterMove(fromFile, fromRank, fromFile + 2, fromRank, isBlack)) return false;
        return true;
    }

    // クイーンサイド（左、file-2）
    if (fileDiff === -2) {
        const rook = boardState[fromRank][0];
        if (!rook || rook.type !== 'R' || rook.piece.pieceData.hasMoved) return false;
        if (boardState[fromRank][1] || boardState[fromRank][2] || boardState[fromRank][3]) return false;
        if (isInCheck(isBlack)) return false;
        if (isInCheck_afterMove(fromFile, fromRank, fromFile - 1, fromRank, isBlack)) return false;
        if (isInCheck_afterMove(fromFile, fromRank, fromFile - 2, fromRank, isBlack)) return false;
        return true;
    }

    return false;
}

function isInCheck_afterMove(fromFile, fromRank, toFile, toRank, isBlack) {
    // 仮に盤面を変更
    const original = boardState[toRank][toFile];
    boardState[toRank][toFile] = boardState[fromRank][fromFile];
    boardState[fromRank][fromFile] = null;

    const result = isInCheck(isBlack);

    // 元に戻す
    boardState[fromRank][fromFile] = boardState[toRank][toFile];
    boardState[toRank][toFile] = original;

    return result;
}

function isMoveLegal(fromFile, fromRank, toFile, toRank, piece) {
    const { type, isBlack } = piece.pieceData;

    if (fromFile === toFile && fromRank === toRank) return false;

    const targetSquare = boardState[toRank][toFile];
    if (targetSquare && targetSquare.isBlack === isBlack) return false;

    switch (type) {
        case 'P': return isPawnMoveLegal(fromFile, fromRank, toFile, toRank, isBlack);
        case 'N': return isKnightMoveLegal(fromFile, fromRank, toFile, toRank);
        case 'B': return isBishopMoveLegal(fromFile, fromRank, toFile, toRank);
        case 'R': return isRookMoveLegal(fromFile, fromRank, toFile, toRank);
        case 'Q': return isQueenMoveLegal(fromFile, fromRank, toFile, toRank);
        case 'K': return isKingMoveLegal(fromFile, fromRank, toFile, toRank, piece.pieceData.isBlack);
        default: return false;
    }
}

function highlightLegalMoves(scene, piece) {
    clearHighlights();

    const { file, rank } = piece.pieceData;
    updateBoardState();

    for (let toRank = 0; toRank < 8; toRank++) {
        for (let toFile = 0; toFile < 8; toFile++) {
            if (isMoveLegal(file, rank, toFile, toRank, piece)) {
                const x = boardStartX + toFile * SQUARE_SIZE;
                const y = boardStartY + toRank * SQUARE_SIZE;

                const highlight = scene.add.rectangle(
                    x + SQUARE_SIZE / 2,
                    y + SQUARE_SIZE / 2,
                    SQUARE_SIZE,
                    SQUARE_SIZE,
                    0x00FF00,
                    0.3
                );
                highlight.setDepth(0);
                highlight.squareData = { file: toFile, rank: toRank };

                highlightedSquares.push(highlight);
            }
        }
    }
}

function createPiece(scene, file, rank, type, isBlack) {
    const x = boardStartX + file * SQUARE_SIZE + SQUARE_SIZE / 2;
    const y = boardStartY + rank * SQUARE_SIZE + SQUARE_SIZE / 2;

    const pieceContainer = scene.add.container(x, y);

    const bgColor = isBlack ? 0x333333 : 0xFFFFFF;
    const bgCircle = scene.add.circle(0, 0, PIECE_BG_RADIUS, bgColor);
    bgCircle.setStrokeStyle(2, 0x000000);
    bgCircle.name = 'background';

    const textColor = isBlack ? '#FFFFFF' : '#000000';
    const pieceText = scene.add.text(0, 0, type, {
        font: 'bold 32px Arial',
        fill: textColor,
        align: 'center'
    }).setOrigin(0.5);

    pieceContainer.add(bgCircle);
    pieceContainer.add(pieceText);

    pieceContainer.pieceData = {
        file: file,
        rank: rank,
        type: type,
        isBlack: isBlack,
        hasMoved: false
    };

    pieceContainer.setInteractive(
        new Phaser.Geom.Circle(0, 0, PIECE_BG_RADIUS),
        Phaser.Geom.Circle.Contains
    );

    scene.input.setDraggable(pieceContainer);

    pieces.push(pieceContainer);
    return pieceContainer;
}

function snapPieceToGrid(piece) {
    const x = piece.x;
    const y = piece.y;

    let file = Math.round((x - boardStartX - SQUARE_SIZE / 2) / SQUARE_SIZE);
    let rank = Math.round((y - boardStartY - SQUARE_SIZE / 2) / SQUARE_SIZE);

    file = Phaser.Math.Clamp(file, 0, 7);
    rank = Phaser.Math.Clamp(rank, 0, 7);

    piece.x = boardStartX + file * SQUARE_SIZE + SQUARE_SIZE / 2;
    piece.y = boardStartY + rank * SQUARE_SIZE + SQUARE_SIZE / 2;

    piece.pieceData.file = file;
    piece.pieceData.rank = rank;
}

function selectPiece(scene, piece) {
    if (piece.pieceData.isBlack === isWhiteTurn) return;

    deselectPiece();
    selectedPiece = piece;

    const bgCircle = piece.getByName('background');
    bgCircle.setStrokeStyle(3, 0xFFDD00);
    piece.setDepth(1);

    highlightLegalMoves(scene, piece);
}

function deselectPiece() {
    if (selectedPiece) {
        const bgCircle = selectedPiece.getByName('background');
        bgCircle.setStrokeStyle(2, 0x000000);
        selectedPiece.setDepth(0);
    }
    selectedPiece = null;
    clearHighlights();
}

function movePiece(targetFile, targetRank, scene, isAI = false) {
    if (!selectedPiece) return;

    const { file, rank, type, isBlack } = selectedPiece.pieceData;

    if (!isMoveLegal(file, rank, targetFile, targetRank, selectedPiece)) {
        deselectPiece();
        return;
    }

    const targetSquare = boardState[targetRank][targetFile];
    if (targetSquare) {
        targetSquare.piece.destroy();
        pieces = pieces.filter(p => p !== targetSquare.piece);
    }

    selectedPiece.pieceData.file = targetFile;
    selectedPiece.pieceData.rank = targetRank;

    selectedPiece.x = boardStartX + targetFile * SQUARE_SIZE + SQUARE_SIZE / 2;
    selectedPiece.y = boardStartY + targetRank * SQUARE_SIZE + SQUARE_SIZE / 2;

    // キャスリング処理
    if (type === 'K' && Math.abs(targetFile - file) === 2) {
        const rookFromFile = targetFile > file ? 7 : 0;
        const rookToFile = targetFile > file ? 5 : 3;

        const rookSquare = boardState[rank][rookFromFile];
        if (rookSquare) {
            rookSquare.piece.pieceData.file = rookToFile;
            rookSquare.piece.pieceData.hasMoved = true;
            rookSquare.piece.x = boardStartX + rookToFile * SQUARE_SIZE + SQUARE_SIZE / 2;
        }
    }

    // プロモーション検出
    if (type === 'P' && (targetRank === 0 || targetRank === 7)) {
        if (isAI) return;
        updateBoardState();
        lastMove = { piece: selectedPiece, fromRank: rank, toRank: targetRank };
        selectedPiece.pieceData.hasMoved = true;
        const promotingPiece = selectedPiece;
        deselectPiece();
        showPromotionUI(scene, promotingPiece, targetFile, targetRank);
        return;
    }

    updateBoardState();

    lastMove = {
        piece: selectedPiece,
        fromRank: rank,
        toRank: targetRank
    };

    isWhiteTurn = !isWhiteTurn;
    if (!isWhiteTurn) {
        askStockfish();
    }

    selectedPiece.pieceData.hasMoved = true;
    deselectPiece();
}

/**
 * すべてのマスをハイライトする
 * @param {Phaser.Scene} scene - Phaserシーン
 */
function highlightAllSquares(scene) {
    clearHighlights();

    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const x = boardStartX + file * SQUARE_SIZE;
            const y = boardStartY + rank * SQUARE_SIZE;

            const highlight = scene.add.rectangle(
                x + SQUARE_SIZE / 2,
                y + SQUARE_SIZE / 2,
                SQUARE_SIZE,
                SQUARE_SIZE,
                0x00FF00,
                0.2
            );
            highlight.setDepth(-1);
            highlight.squareData = { file, rank };

            highlightedSquares.push(highlight);
        }
    }
}

function setupPieceDragEvents(scene) {
    let draggedPiece = null;
    let originalX, originalY;
    let isDragging = false;

    scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        if (pieces.includes(gameObject) && !isDragging) {
            if (gameObject.pieceData.isBlack === isWhiteTurn) return;

            isDragging = true;
            draggedPiece = gameObject;
            originalX = draggedPiece.x;
            originalY = draggedPiece.y;
            selectPiece(scene, draggedPiece);
        }

        if (gameObject === draggedPiece) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        }
    });

    scene.input.on('dragend', (pointer, gameObject) => {
        if (gameObject === draggedPiece) {
            const x = gameObject.x;
            const y = gameObject.y;

            let targetFile = Math.round((x - boardStartX - SQUARE_SIZE / 2) / SQUARE_SIZE);
            let targetRank = Math.round((y - boardStartY - SQUARE_SIZE / 2) / SQUARE_SIZE);

            targetFile = Phaser.Math.Clamp(targetFile, 0, 7);
            targetRank = Phaser.Math.Clamp(targetRank, 0, 7);

            const { file, rank, type, isBlack } = gameObject.pieceData;

            if (file !== targetFile || rank !== targetRank) {
                if (isMoveLegal(file, rank, targetFile, targetRank, gameObject)) {
                    const targetSquare = boardState[targetRank][targetFile];
                    if (targetSquare) {
                        targetSquare.piece.destroy();
                        pieces = pieces.filter(p => p !== targetSquare.piece);
                    }

                    // en passantキャプチャ
                    if (type === 'P' && targetFile !== file && !targetSquare) {
                        const capturedSquare = boardState[rank][targetFile];
                        if (capturedSquare && capturedSquare.type === 'P' && capturedSquare.isBlack !== isBlack) {
                            capturedSquare.piece.destroy();
                            pieces = pieces.filter(p => p !== capturedSquare.piece);
                        }
                    }

                    gameObject.pieceData.file = targetFile;
                    gameObject.pieceData.rank = targetRank;
                    gameObject.x = boardStartX + targetFile * SQUARE_SIZE + SQUARE_SIZE / 2;
                    gameObject.y = boardStartY + targetRank * SQUARE_SIZE + SQUARE_SIZE / 2;

                    // キャスリング処理
                    if (type === 'K' && Math.abs(targetFile - file) === 2) {
                        const rookFromFile = targetFile > file ? 7 : 0;
                        const rookToFile = targetFile > file ? 5 : 3;

                        const rookSquare = boardState[rank][rookFromFile];
                        if (rookSquare) {
                            rookSquare.piece.pieceData.file = rookToFile;
                            rookSquare.piece.pieceData.hasMoved = true;
                            rookSquare.piece.x = boardStartX + rookToFile * SQUARE_SIZE + SQUARE_SIZE / 2;
                        }
                    }

                    lastMove = {
                        piece: gameObject,
                        fromRank: rank,
                        toRank: targetRank
                    };

                    // プロモーション検出
                    if (type === 'P' && (targetRank === 0 || targetRank === 7)) {
                        updateBoardState();
                        lastMove = { piece: gameObject, fromRank: rank, toRank: targetRank };
                        gameObject.pieceData.hasMoved = true;
                        const promotingPiece = gameObject;
                        draggedPiece = null;
                        isDragging = false;
                        clearHighlights();
                        showPromotionUI(scene, promotingPiece, targetFile, targetRank);
                        return;
                    }

                    updateBoardState();

                    isWhiteTurn = !isWhiteTurn;
                    if (!isWhiteTurn) {
                        askStockfish();
                    }

                    gameObject.pieceData.hasMoved = true;
                } else {
                    gameObject.x = originalX;
                    gameObject.y = originalY;
                }
            }

            if (file === targetFile && rank === targetRank) {
                gameObject.x = originalX;
                gameObject.y = originalY;
            }

            draggedPiece = null;
            isDragging = false;
            clearHighlights();
            deselectPiece();
        }
    });
}

function clearHighlights() {
    highlightedSquares.forEach(highlight => {
        highlight.destroy();
    });
    highlightedSquares = [];
}

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

function isInCheck(isBlack) {
    // 自分のキングの位置を探す
    let kingFile, kingRank;
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const square = boardState[rank][file];
            if (square && square.type === 'K' && square.isBlack === isBlack) {
                kingFile = file;
                kingRank = rank;
            }
        }
    }

    // 相手の全駒がキングに移動できるか確認
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const square = boardState[rank][file];
            if (square && square.isBlack !== isBlack) {
                if (isMoveLegal(file, rank, kingFile, kingRank, square.piece)) {
                    return true;
                }
            }
        }
    }

    return false;
}

function generateFEN() {
    let fen = '';

    for (let rank = 0; rank < 8; rank++) {
        let empty = 0;
        for (let file = 0; file < 8; file++) {
            const square = boardState[rank][file];
            if (square) {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                const letter = square.isBlack ? square.type.toLowerCase() : square.type;
                fen += letter;
            } else {
                empty++;
            }
        }
        if (empty > 0) fen += empty;
        if (rank < 7) fen += '/';
    }

    // 手番
    fen += isWhiteTurn ? ' w' : ' b';

    // キャスリング権
    let castling = '';
    const whiteKing = pieces.find(p => p.pieceData.type === 'K' && !p.pieceData.isBlack);
    const blackKing = pieces.find(p => p.pieceData.type === 'K' && p.pieceData.isBlack);
    const whiteRooks = pieces.filter(p => p.pieceData.type === 'R' && !p.pieceData.isBlack);
    const blackRooks = pieces.filter(p => p.pieceData.type === 'R' && p.pieceData.isBlack);

    if (whiteKing && !whiteKing.pieceData.hasMoved) {
        const kingsideRook = whiteRooks.find(r => r.pieceData.file === 7 && r.pieceData.rank === 7);
        const queensideRook = whiteRooks.find(r => r.pieceData.file === 0 && r.pieceData.rank === 7);
        if (kingsideRook && !kingsideRook.pieceData.hasMoved) castling += 'K';
        if (queensideRook && !queensideRook.pieceData.hasMoved) castling += 'Q';
    }
    if (blackKing && !blackKing.pieceData.hasMoved) {
        const kingsideRook = blackRooks.find(r => r.pieceData.file === 7 && r.pieceData.rank === 0);
        const queensideRook = blackRooks.find(r => r.pieceData.file === 0 && r.pieceData.rank === 0);
        if (kingsideRook && !kingsideRook.pieceData.hasMoved) castling += 'k';
        if (queensideRook && !queensideRook.pieceData.hasMoved) castling += 'q';
    }
    if (castling === '') castling = '-';

    fen += ' ' + castling;

    // en passant
    fen += ' -';

    // ハーフムーブ・フルムーブ（簡易版）
    fen += ' 0 1';

    return fen;
}

function executeStockfishMove(scene, move) {
    const fromFile = move.charCodeAt(0) - 'a'.charCodeAt(0);
    const fromRank = 8 - parseInt(move[1]);
    const toFile = move.charCodeAt(2) - 'a'.charCodeAt(0);
    const toRank = 8 - parseInt(move[3]);
    const promotionType = move[4] ? move[4].toUpperCase() : null; // 追加

    updateBoardState();

    const fromSquare = boardState[fromRank][fromFile];
    if (!fromSquare) return;

    const piece = fromSquare.piece;
    selectedPiece = piece;
    movePiece(toFile, toRank, scene, true);

    // プロモーション処理
    if (promotionType && piece.pieceData.type === 'P') {
        piece.pieceData.type = promotionType;
        const pieceText = piece.getAt(1);
        pieceText.setText(promotionType);
        updateBoardState();
    }
}

function showPromotionUI(scene, piece, targetFile, targetRank) {
    const isBlack = piece.pieceData.isBlack;
    const choices = ['Q', 'R', 'B', 'N'];
    const uiElements = [];

    // 背景
    const bg = scene.add.rectangle(
        scene.cameras.main.centerX,
        scene.cameras.main.centerY,
        300, 100,
        0x000000, 0.8
    ).setDepth(10);
    uiElements.push(bg);

    choices.forEach((type, i) => {
        const x = scene.cameras.main.centerX - 150 + i * 75 + 37;
        const y = scene.cameras.main.centerY;

        const btn = scene.add.circle(x, y, 28, isBlack ? 0x333333 : 0xFFFFFF).setDepth(11);
        btn.setStrokeStyle(2, 0x000000);
        uiElements.push(btn);

        const text = scene.add.text(x, y, type, {
            font: 'bold 32px Arial',
            fill: isBlack ? '#FFFFFF' : '#000000'
        }).setOrigin(0.5).setDepth(12);
        uiElements.push(text);

        btn.setInteractive();
        btn.on('pointerdown', () => {
            // UIを消す
            uiElements.forEach(el => el.destroy());

            // 駒を置き換え
            piece.pieceData.type = type;
            const pieceText = piece.getAt(1);
            pieceText.setText(type);

            updateBoardState();
            isWhiteTurn = !isWhiteTurn;
            if (!isWhiteTurn) askStockfish();
        });
    });
}
