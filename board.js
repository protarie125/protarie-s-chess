// チェス盤の設定
const BOARD_SIZE = 8;
const SQUARE_SIZE = 80;
const BOARD_PIXEL_SIZE = SQUARE_SIZE * BOARD_SIZE;
const LABEL_SIZE = 40;

// 無彩色（グレースケール）
const LIGHT_SQUARE = 0xE0E0E0;   // ライトグレー
const DARK_SQUARE = 0x808080;    // ダークグレー

let boardStartX, boardStartY;

/**
 * チェス盤を描画する
 * @param {Phaser.Scene} scene - Phaserシーン
 */
function createBoard(scene) {
    const centerX = scene.cameras.main.centerX;
    const centerY = scene.cameras.main.centerY;
    
    // ボードを中央に配置
    boardStartX = centerX - BOARD_PIXEL_SIZE / 2;
    boardStartY = centerY - BOARD_PIXEL_SIZE / 2;
    
    // チェス盤の背景
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 8x8のマスを描画
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const x = file * SQUARE_SIZE;
            const y = rank * SQUARE_SIZE;
            
            // 市松模様の色を決定
            const isLight = (rank + file) % 2 === 0;
            const color = isLight ? LIGHT_SQUARE : DARK_SQUARE;
            
            graphics.fillStyle(color);
            graphics.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
            
            // マスの枠線（微かに）
            graphics.lineStyle(1, 0x666666, 0.2);
            graphics.strokeRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
        }
    }
    
    // ボードの枠線
    graphics.lineStyle(3, 0x666666);
    graphics.strokeRect(0, 0, BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE);
    
    graphics.generateTexture('boardTexture', BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE);
    graphics.destroy();
    
    // ボードを画像として追加（画面中央）
    scene.add.image(boardStartX + BOARD_PIXEL_SIZE / 2, boardStartY + BOARD_PIXEL_SIZE / 2, 'boardTexture');
    
    // ファイルラベル（A-H）を描画
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
    
    // ランクラベル（1-8）を描画
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
