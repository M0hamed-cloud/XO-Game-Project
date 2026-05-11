const cells = document.querySelectorAll(".cell");
const statustext = document.querySelector("#status");
const restartbtn = document.querySelector("#restart");
const resetScoreBtn = document.querySelector("#reset");
const xscoreDisplay = document.querySelector("#xscore");
const oscoreDisplay = document.querySelector("#oscore");

const winconditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

let options = ["", "", "", "", "", "", "", "", ""];
let currentplayer = "X";
let running = false;
let score = { X: 0, O: 0 };
let vsAI = false;

loadScore();
initializegame();

function initializegame() {
    cells.forEach(cell => cell.addEventListener("click", cellclicked));
    restartbtn.addEventListener("click", restartgame);
    resetScoreBtn.addEventListener("click", resetScores);
    statustext.textContent = `${currentplayer}'s turn`;
    running = true;

    // FIX 1: restartGame() -> restartgame() to match your function name
    document.querySelector("#pvpBtn").addEventListener("click", () => {
        vsAI = false;
        document.querySelector("#pvpBtn").classList.add("active");
        document.querySelector("#aiBtn").classList.remove("active");
        restartgame();
    });

    document.querySelector("#aiBtn").addEventListener("click", () => {
        vsAI = true;
        document.querySelector("#aiBtn").classList.add("active");
        document.querySelector("#pvpBtn").classList.remove("active");
        restartgame();
    });
}

function cellclicked() {
    const cellindex = this.getAttribute("data-cell-index");

    if (options[cellindex] !== "" || !running) {
        return;
    }

    updatecell(this, cellindex);
    checkwinner();
}

function updatecell(cell, index) {
    options[index] = currentplayer;
    cell.textContent = currentplayer;
}

function changeplayer() {
    currentplayer = currentplayer === "X" ? "O" : "X";
    statustext.textContent = `${currentplayer}'s turn`;
}

function checkwinner() {
    let roundwon = false;

    for (let i = 0; i < winconditions.length; i++) {
        const condition = winconditions[i];
        const cellA = options[condition[0]];
        const cellB = options[condition[1]];
        const cellC = options[condition[2]];

        if (cellA === "" || cellB === "" || cellC === "") {
            continue;
        }

        if (cellA === cellB && cellB === cellC) {
            roundwon = true;
            break;
        }
    }

    if (roundwon) {
        score[currentplayer]++;
        updatescoreDisplay();
        saveScore();
        statustext.textContent = `${currentplayer} wins!`;
        running = false;
        return;
    }

    else if (!options.includes("")) {
        statustext.textContent = "Draw!";
        running = false;
        return;
    }

    else if (!options.includes("")) {
    statustext.textContent = "Draw!";
    running = false;
    currentplayer = "X";  // add this — reset to X after a draw
    return;
}


    else {
        // FIX 2: changePlayer() -> changeplayer(), currentPlayer -> currentplayer
        changeplayer();
        if (vsAI && currentplayer === "O" && running) {
            setTimeout(aimove, 400);
        }
    }
}

function saveScore() {
    localStorage.setItem("tictactoeScore", JSON.stringify(score));
}

function loadScore() {
    const savedScore = localStorage.getItem("tictactoeScore");
    if (savedScore) {
        score = JSON.parse(savedScore);
        updatescoreDisplay();
    }
}

function resetScores() {
    score = { X: 0, O: 0 };
    updatescoreDisplay();
    localStorage.removeItem("tictactoeScore");
}

function restartgame() {
    options = ["", "", "", "", "", "", "", "", ""];
    statustext.textContent = `${currentplayer}'s turn`;
    cells.forEach(cell => { cell.textContent = ""; cell.style.color = ""; });
    running = true;

    const oldLine = document.getElementById("winLine");
    if (oldLine) oldLine.remove();

    // if AI won and goes first, trigger its move automatically
    if (vsAI && currentplayer === "O" && running) {
        setTimeout(aimove, 600);
    }
}

function updatescoreDisplay() {
    xscoreDisplay.textContent = score.X;
    oscoreDisplay.textContent = score.O;
}

// FIX 3: aiMove() -> aimove(), updateCell() -> updatecell(), checkWinner() -> checkwinner()
function aimove() {
    const bestIndex = getBestMove();
    updatecell(cells[bestIndex], bestIndex);
    checkwinner();
}

function getBestMove() {
    let bestScore = -Infinity;
    let bestIndex = null;

    for (let i = 0; i < 9; i++) {
        if (options[i] === "") {
            options[i] = "O";
            let s = minimax(options, 0, false);  // FIX 4: renamed to "s" to avoid shadowing the score variable
            options[i] = "";
            if (s > bestScore) {
                bestScore = s;
                bestIndex = i;
            }
        }
    }
    return bestIndex;
}

function minimax(board, depth, isMaximizing) {
    const result = evaluateBoard();
    if (result !== null) return result;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "O";
                bestScore = Math.max(bestScore, minimax(board, depth + 1, false));
                board[i] = "";
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "X";
                bestScore = Math.min(bestScore, minimax(board, depth + 1, true));
                board[i] = "";
            }
        }
        return bestScore;
    }
}

function evaluateBoard() {
    // FIX 5: winConditions -> winconditions to match your variable name
    for (const [a, b, c] of winconditions) {
        if (options[a] && options[a] === options[b] && options[b] === options[c]) {
            return options[a] === "O" ? 10 : -10;
        }
    }
    if (!options.includes("")) return 0;
    return null;
}