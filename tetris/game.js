const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');
context.scale(20, 20);

// ゲームのフィールド（arena）とプレイヤー（player）の状態を定義
const arena = createMatrix(10, 20);
const player = {
    pos: {x: 5, y: 5},
};

const tetriminoColors = [
    null, // 0はテトリミノの一部ではないため、色はなし
    'red', // I テトリミノ
    'blue', // O テトリミノ
    'green', // T テトリミノ
    'yellow', // Z テトリミノ
    'orange', // J テトリミノ
    'cyan', // L テトリミノ
    'magenta' // S テトリミノ
];

let bag = [];
let nextPiece = null;




playerReset();

player.score = 0; 

let dropCounter = 0;
let dropInterval = 700; // 0.7秒ごとにテトリミノを落下させます
let lastTime = 0;

let colortype = 0;




function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer; // 空のセルがあれば、この行はスキップ
            }
        }

        // 行が全て埋まっている場合、その行を削除し、上にある行を下にずらす
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}


function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && // テトリミノのブロックが存在する
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                // アリーナの同じ位置にブロックが存在する、またはアリーナの境界外である
                return true;
            }
        }
    }
    return false;
}


function createMatrix(w, h) {
    const matrix = [];
    // 高さhに対して繰り返し処理を行う
    for (let y = 0; y < h; y++) {
        // 新しい行を表す空の配列を作成
        const row = [];
        for (let x = 0; x < w; x++) {
            // 各セルを0で初期化（0は空のセルを意味する）
            row.push(0);
        }
        // 完成した行をマトリックスに追加
        matrix.push(row);
    }
    return matrix;
}


function createPiece(type) {    
    if (type === 'I') {
        return [
            [0, 0, 0, 0],
            [1, 1, 1, 1], // Iテトリミノに1を割り当てる
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
    } else if (type === 'J') {
        return [
            [0, 0, 2],
            [0, 0, 2],
            [0, 2, 2]  // Jテトリミノに2を割り当てる
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]  // Lテトリミノに3を割り当てる
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4]  // Oテトリミノに4を割り当てる
        ];
    } else if (type === 'S') {
        return [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0]  // Sテトリミノに5を割り当てる
        ];
    } else if (type === 'T') {
        return [
            [0, 6, 0],
            [6, 6, 6],
            [0, 0, 0]  // Tテトリミノに6を割り当てる
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]  // Zテトリミノに7を割り当てる
        ];
    }
    // 不正なタイプが指定された場合は空の配列を返す
    return [];
}



function generateBag() {
    const pieces = 'TJLOSZI';
    bag = pieces.split('').map(function(type) {
        return type;
    });

    // バッグ内のピースをシャッフル
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
}

function playerReset() {
    if (bag.length === 0) {
        generateBag();
    }
    if (nextPiece === null) {
        nextPiece = bag.pop();
    }
    player.matrix = createPiece(nextPiece);
    nextPiece = bag.pop();

    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        alert('ゲームオーバー！ あなたのスコアは ' + player.score + ' です。');
        window.location.reload();
    }
    drawNextPiece();
}

// createPiece関数はそのまま使用します
// drawMatrix関数もそのまま使用します

// 初期化時やゲームオーバー時にplayerResetを呼び出す処理を忘れないでください

// 次のテトリミノを描画する関数
// 次のテトリミノを描画する関数
// Function to draw the next Tetrimino
function drawNextPiece() {
    const canvas = document.getElementById('nextPiece');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const matrix = createPiece(nextPiece);
    const scale = 20; // ここでブロックのサイズ（ピクセル単位）を設定します。
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = tetriminoColors[value];
                // スケールを適用してブロックを描画
                context.fillRect((x + 1) * scale, (y + 1) * scale, scale, scale);
            }
        });
    });
}


function draw() {
    context.fillStyle = '#000'; // 背景色を黒に設定
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    drawMatrix(arena, {x: 0, y: 0}); // ゲームフィールドを描画
    drawMatrix(player.matrix, player.pos); // 操作中のテトリミノを描画
}


function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = tetriminoColors[value]; // 四角の色をtetriminoColors配列から設定
                context.fillRect(x + offset.x, y + offset.y, 1, 1); // 四角を描画
            }
        });
    });
}




function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // プレイヤーのテトリミノ（valueが0でない部分）をゲームフィールドにコピーする
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    // First, transpose the matrix (swap rows and columns)
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }

    // Then, reverse the rows for clockwise rotation or columns for counterclockwise rotation
    if (dir > 0) {
        // Clockwise rotation
        matrix.forEach(row => row.reverse());
    } else {
        // Counterclockwise rotation
        matrix.reverse();
    }
}

function updateScore(newScore) {
    // スコアを更新
    player.score += newScore;
    // HTMLのスコア表示を更新
    var scoreElement = document.getElementById('score');
    scoreElement.textContent = '現在のスコア：' + player.score;
}


function playerDrop() {
    player.pos.y++; // Move the Tetrimino down by one row
    if (collide(arena, player)) {
        player.pos.y--; // Move back up if there's a collision
        merge(arena, player); // Fix the Tetrimino into the arena
        playerReset(); // Prepare a new Tetrimino for the player
        arenaSweep(); // Check for and clear any filled lines
        updateScore(2); // Update the game score if lines were cleared
    }
    dropCounter = 0; // Reset the drop counter
}


function playerMove(dir) {
    // プレイヤーの位置を更新する
    player.pos.x += dir;
    // もし衝突があれば、移動を元に戻す
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}


function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir); // テトリミノを回転させる
    while (collide(arena, player)) { // 衝突検出
        player.pos.x += offset; // 衝突を避けるために位置を調整
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir); // 元に戻す
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function update(time = 0) {
    const deltaTime = time - lastTime; // 前回のフレームからの経過時間を計算
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw(); // ここでゲームの状態を描画する関数を呼び出します
    requestAnimationFrame(update);
}



document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-1); // 左矢印キーが押されたときに左に移動
    } else if (event.key === 'ArrowRight') {
        playerMove(1); // 右矢印キーが押されたときに右に移動
    } else if (event.key === 'ArrowDown') {
        playerDrop(); // 下矢印キーが押されたときにテトリミノを落下させる
    } else if (event.key === 'ArrowUp') {
        playerRotate(1); // 上矢印キーが押されたときにテトリミノを回転させる
    }
});

update();
