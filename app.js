const PIECES = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

const PIECE_VALUE = {
  p: 100,
  n: 315,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

const POSITION_BONUS = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 28, 28, 10,  5,  5,
     0,  0,  0, 24, 24,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-24,-24, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -30,  5, 12, 15, 15, 12,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 12, 15, 15, 12,  0,-30,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  8,  8,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0, 12, 12,  5,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
     20, 30, 10,  0,  0, 10, 30, 20,
     20, 20,  0,  0,  0,  0, 20, 20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
  ],
};

const LEVELS = {
  1: { label: "Разминка", depth: 0, randomness: 0.75, blunder: 0.35 },
  2: { label: "Классика", depth: 1, randomness: 0.35, blunder: 0.15 },
  3: { label: "Стратегия", depth: 2, randomness: 0.16, blunder: 0.05 },
  4: { label: "Эксперт", depth: 2, randomness: 0.05, blunder: 0.00 },
  5: { label: "BORK Mode", depth: 3, randomness: 0.02, blunder: 0.00 },
};

let ChessCtor = null;
let game = null;
let selectedSquare = null;
let legalTargets = [];
let playerColor = "w";
let boardOrientation = "w";
let difficulty = 1;
let botThinking = false;
let lastMove = null;
let gameStarted = false;
let gameResultSaved = false;

const el = {
  board: document.querySelector("#board"),
  gameStatus: document.querySelector("#gameStatus"),
  turnIndicator: document.querySelector("#turnIndicator"),
  engineStatus: document.querySelector("#engineStatus"),
  startBtn: document.querySelector("#startBtn"),
  demoBtn: document.querySelector("#demoBtn"),
  newGameBtn: document.querySelector("#newGameBtn"),
  undoBtn: document.querySelector("#undoBtn"),
  flipBtn: document.querySelector("#flipBtn"),
  moveList: document.querySelector("#moveList"),
  fenBox: document.querySelector("#fenBox"),
  toast: document.querySelector("#toast"),
  copyPgnBtn: document.querySelector("#copyPgnBtn"),
  wins: document.querySelector("#wins"),
  losses: document.querySelector("#losses"),
  draws: document.querySelector("#draws"),
  topFiles: document.querySelector("#topFiles"),
  bottomFiles: document.querySelector("#bottomFiles"),
  leftRanks: document.querySelector("#leftRanks"),
  rightRanks: document.querySelector("#rightRanks"),
};

function getStats() {
  try {
    return JSON.parse(localStorage.getItem("borkChessStats")) || { wins: 0, losses: 0, draws: 0 };
  } catch {
    return { wins: 0, losses: 0, draws: 0 };
  }
}

function setStats(stats) {
  localStorage.setItem("borkChessStats", JSON.stringify(stats));
  renderStats();
}

function renderStats() {
  const stats = getStats();
  el.wins.textContent = stats.wins;
  el.losses.textContent = stats.losses;
  el.draws.textContent = stats.draws;
}

function toast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  window.clearTimeout(toast._timer);
  toast._timer = window.setTimeout(() => el.toast.classList.remove("show"), 2600);
}

async function loadChess() {
  const sources = [
    "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js",
    "https://esm.sh/chess.js@1.4.0",
  ];

  for (const source of sources) {
    try {
      const mod = await import(source);
      const Candidate = mod.Chess || mod.default;
      if (Candidate) {
        ChessCtor = Candidate;
        return;
      }
    } catch (error) {
      console.warn("Chess source failed:", source, error);
    }
  }

  throw new Error("Не удалось загрузить chess.js");
}

function safe(methodName, fallback = false) {
  try {
    const value = game?.[methodName];
    return typeof value === "function" ? value.call(game) : fallback;
  } catch {
    return fallback;
  }
}

function isGameOver() {
  return safe("isGameOver") || safe("game_over");
}

function isCheckmate() {
  return safe("isCheckmate") || safe("in_checkmate");
}

function isDraw() {
  return safe("isDraw") || safe("in_draw");
}

function isStalemate() {
  return safe("isStalemate") || safe("in_stalemate");
}

function isCheck() {
  return safe("isCheck") || safe("in_check");
}

function filesForOrientation() {
  return boardOrientation === "w"
    ? ["a", "b", "c", "d", "e", "f", "g", "h"]
    : ["h", "g", "f", "e", "d", "c", "b", "a"];
}

function ranksForOrientation() {
  return boardOrientation === "w"
    ? ["8", "7", "6", "5", "4", "3", "2", "1"]
    : ["1", "2", "3", "4", "5", "6", "7", "8"];
}

function squaresForOrientation() {
  const files = filesForOrientation();
  const ranks = ranksForOrientation();
  return ranks.flatMap(rank => files.map(file => `${file}${rank}`));
}

function renderCoordinates() {
  const files = filesForOrientation();
  const ranks = ranksForOrientation();

  el.topFiles.innerHTML = files.map(f => `<span>${f}</span>`).join("");
  el.bottomFiles.innerHTML = files.map(f => `<span>${f}</span>`).join("");
  el.leftRanks.innerHTML = ranks.map(r => `<span>${r}</span>`).join("");
  el.rightRanks.innerHTML = ranks.map(r => `<span>${r}</span>`).join("");
}

function getPiece(square) {
  return game.get(square);
}

function isLegalTarget(square) {
  return legalTargets.some(move => move.to === square);
}

function getKingSquare(color) {
  const board = game.board();
  for (const row of board) {
    for (const piece of row) {
      if (piece && piece.type === "k" && piece.color === color) {
        return piece.square;
      }
    }
  }
  return null;
}

function renderBoard() {
  renderCoordinates();

  const squares = squaresForOrientation();
  const checkSquare = isCheck() ? getKingSquare(game.turn()) : null;

  el.board.innerHTML = squares.map((square) => {
    const file = square.charCodeAt(0) - 97;
    const rank = Number(square[1]);
    const isLight = (file + rank) % 2 === 1;
    const piece = getPiece(square);
    const legal = isLegalTarget(square);
    const capture = legal && piece;
    const last = lastMove && (lastMove.from === square || lastMove.to === square);
    const selected = selectedSquare === square;
    const check = checkSquare === square;

    const classes = [
      "square",
      isLight ? "light" : "dark",
      selected ? "selected" : "",
      legal ? "legal" : "",
      capture ? "capture" : "",
      last ? "last-move" : "",
      check ? "check" : "",
    ].filter(Boolean).join(" ");

    const pieceSymbol = piece ? PIECES[`${piece.color}${piece.type}`] : "";
    return `<button class="${classes}" data-square="${square}" aria-label="${square}">
      <span class="piece">${pieceSymbol}</span>
    </button>`;
  }).join("");

  el.board.querySelectorAll(".square").forEach(squareEl => {
    squareEl.addEventListener("click", () => handleSquareClick(squareEl.dataset.square));
  });

  updateMeta();
}

function renderMoves() {
  const verboseHistory = game.history({ verbose: true });
  el.moveList.innerHTML = "";
  for (let i = 0; i < verboseHistory.length; i += 2) {
    const white = verboseHistory[i]?.san || "";
    const black = verboseHistory[i + 1]?.san || "";
    const li = document.createElement("li");
    li.textContent = `${white}${black ? "  ·  " + black : ""}`;
    el.moveList.appendChild(li);
  }
  el.moveList.scrollTop = el.moveList.scrollHeight;
}

function updateMeta() {
  const status = statusText();
  el.gameStatus.textContent = status;
  el.turnIndicator.textContent = game.turn() === "w" ? "Ход белых" : "Ход чёрных";
  el.fenBox.value = game.fen();
  renderMoves();

  el.undoBtn.disabled = !gameStarted || botThinking || game.history().length === 0;
}

function statusText() {
  if (!gameStarted) return "Готов к партии";
  if (isCheckmate()) {
    const winner = game.turn() === "w" ? "чёрных" : "белых";
    return `Мат. Победа ${winner}`;
  }
  if (isStalemate()) return "Пат. Ничья";
  if (isDraw()) return "Ничья";
  if (isCheck()) return "Шах";
  if (botThinking) return "AI анализирует позицию";
  return game.turn() === playerColor ? "Ваш ход" : "Ход AI";
}

function normalizeMove(move) {
  if (!move) return null;
  if (typeof move === "string") return move;
  return { from: move.from, to: move.to, promotion: move.promotion || "q" };
}

function makeMove(move) {
  const result = game.move(normalizeMove(move));
  if (result) {
    lastMove = { from: result.from, to: result.to };
    selectedSquare = null;
    legalTargets = [];
    renderBoard();
    checkResultAndSave();
  }
  return result;
}

function checkResultAndSave() {
  if (!gameStarted || gameResultSaved || !isGameOver()) return;

  gameResultSaved = true;
  const stats = getStats();

  if (isDraw() || isStalemate()) {
    stats.draws += 1;
    toast("Партия завершена ничьей");
  } else if (isCheckmate()) {
    const winnerColor = game.turn() === "w" ? "b" : "w";
    if (winnerColor === playerColor) {
      stats.wins += 1;
      toast("Победа. Элегантно.");
    } else {
      stats.losses += 1;
      toast("Поражение. Позицию можно пересобрать.");
    }
  }

  setStats(stats);
}

function handleSquareClick(square) {
  if (!gameStarted || botThinking || isGameOver()) return;
  if (game.turn() !== playerColor) return;

  const piece = getPiece(square);
  const clickedOwnPiece = piece && piece.color === playerColor;

  if (selectedSquare && isLegalTarget(square)) {
    const move = legalTargets.find(item => item.to === square);
    const result = makeMove(move);
    if (result && !isGameOver()) {
      window.setTimeout(botMove, 260);
    }
    return;
  }

  if (clickedOwnPiece) {
    selectedSquare = square;
    legalTargets = game.moves({ square, verbose: true });
    renderBoard();
    return;
  }

  selectedSquare = null;
  legalTargets = [];
  renderBoard();
}

function evaluateBoard() {
  if (isCheckmate()) {
    return game.turn() === "w" ? -999999 : 999999;
  }
  if (isDraw() || isStalemate()) return 0;

  let score = 0;
  const board = game.board();

  for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
    for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex++) {
      const piece = board[rowIndex][colIndex];
      if (!piece) continue;

      const table = POSITION_BONUS[piece.type] || Array(64).fill(0);
      const whiteIndex = rowIndex * 8 + colIndex;
      const blackIndex = (7 - rowIndex) * 8 + colIndex;
      const positional = piece.color === "w" ? table[whiteIndex] : table[blackIndex];
      const value = PIECE_VALUE[piece.type] + positional;
      score += piece.color === "w" ? value : -value;
    }
  }

  const mobility = game.moves().length;
  score += game.turn() === "w" ? mobility : -mobility;

  return score;
}

function orderedMoves() {
  return game.moves({ verbose: true }).sort((a, b) => {
    const captureA = a.captured ? PIECE_VALUE[a.captured] || 0 : 0;
    const captureB = b.captured ? PIECE_VALUE[b.captured] || 0 : 0;
    const promoA = a.promotion ? 500 : 0;
    const promoB = b.promotion ? 500 : 0;
    return (captureB + promoB) - (captureA + promoA);
  });
}

function minimax(depth, alpha, beta, maximizingWhite) {
  if (depth === 0 || isGameOver()) {
    return evaluateBoard();
  }

  const moves = orderedMoves();

  if (maximizingWhite) {
    let best = -Infinity;
    for (const move of moves) {
      game.move(normalizeMove(move));
      best = Math.max(best, minimax(depth - 1, alpha, beta, false));
      game.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    game.move(normalizeMove(move));
    best = Math.min(best, minimax(depth - 1, alpha, beta, true));
    game.undo();
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function evaluateMove(move, botColor, depth) {
  game.move(normalizeMove(move));
  const score = minimax(Math.max(0, depth - 1), -Infinity, Infinity, game.turn() === "w");
  game.undo();

  const fromBotPerspective = botColor === "w" ? score : -score;
  const noise = (Math.random() - 0.5) * 20;
  return fromBotPerspective + noise;
}

function chooseBotMove() {
  const config = LEVELS[difficulty];
  const moves = game.moves({ verbose: true });
  const botColor = game.turn();

  if (!moves.length) return null;

  if (config.blunder && Math.random() < config.blunder) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (config.depth === 0) {
    const captures = moves.filter(move => move.captured);
    const pool = captures.length && Math.random() > 0.55 ? captures : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const scored = moves.map(move => ({
    move,
    score: evaluateMove(move, botColor, config.depth),
  })).sort((a, b) => b.score - a.score);

  if (Math.random() < config.randomness) {
    const topCount = Math.min(scored.length, difficulty === 1 ? 8 : difficulty === 2 ? 5 : 3);
    return scored[Math.floor(Math.random() * topCount)].move;
  }

  return scored[0].move;
}

async function botMove() {
  if (!gameStarted || isGameOver() || game.turn() === playerColor) return;

  botThinking = true;
  renderBoard();

  await new Promise(resolve => setTimeout(resolve, 320));

  const move = chooseBotMove();
  if (move) {
    makeMove(move);
  }

  botThinking = false;
  renderBoard();
}

function startGame(options = {}) {
  playerColor = options.color || playerColor;
  difficulty = Number(options.level || difficulty);
  boardOrientation = playerColor;
  game = new ChessCtor();
  gameStarted = true;
  gameResultSaved = false;
  selectedSquare = null;
  legalTargets = [];
  lastMove = null;

  document.querySelectorAll("[data-color]").forEach(button => {
    button.classList.toggle("active", button.dataset.color === playerColor);
  });

  document.querySelectorAll("[data-level]").forEach(button => {
    button.classList.toggle("active", Number(button.dataset.level) === difficulty);
  });

  toast(`Партия началась: ${LEVELS[difficulty].label}`);
  renderBoard();

  if (playerColor === "b") {
    window.setTimeout(botMove, 400);
  }
}

function undoMove() {
  if (!gameStarted || botThinking) return;

  if (game.history().length === 0) return;

  if (game.turn() === playerColor) {
    game.undo();
    if (game.history().length) game.undo();
  } else {
    game.undo();
  }

  const history = game.history({ verbose: true });
  lastMove = history.length ? { from: history.at(-1).from, to: history.at(-1).to } : null;
  gameResultSaved = false;
  selectedSquare = null;
  legalTargets = [];
  renderBoard();
  toast("Ход отменён");
}

function copyPgn() {
  const pgn = game.pgn();
  navigator.clipboard?.writeText(pgn).then(
    () => toast("PGN скопирован"),
    () => {
      el.fenBox.select();
      toast("PGN не скопирован автоматически. Можно скопировать FEN.");
    }
  );
}

function initInteractions() {
  document.querySelectorAll("[data-color]").forEach(button => {
    button.addEventListener("click", () => {
      playerColor = button.dataset.color;
      document.querySelectorAll("[data-color]").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
    });
  });

  document.querySelectorAll("[data-level]").forEach(button => {
    button.addEventListener("click", () => {
      difficulty = Number(button.dataset.level);
      document.querySelectorAll("[data-level]").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
    });
  });

  el.startBtn.addEventListener("click", () => startGame());
  el.demoBtn.addEventListener("click", () => startGame({ color: "w", level: 2 }));
  el.newGameBtn.addEventListener("click", () => startGame());
  el.undoBtn.addEventListener("click", undoMove);
  el.flipBtn.addEventListener("click", () => {
    boardOrientation = boardOrientation === "w" ? "b" : "w";
    renderBoard();
  });
  el.copyPgnBtn.addEventListener("click", copyPgn);
}

async function init() {
  renderStats();
  initInteractions();

  try {
    await loadChess();
    game = new ChessCtor();
    el.engineStatus.textContent = "Движок готов";
    el.engineStatus.classList.add("ready");
    renderBoard();
  } catch (error) {
    console.error(error);
    el.engineStatus.textContent = "Ошибка загрузки";
    el.engineStatus.classList.add("error");
    el.gameStatus.textContent = "Нужен доступ к CDN";
    toast("Не удалось загрузить шахматную библиотеку. Проверьте интернет или CDN.");
  }
}

init();
