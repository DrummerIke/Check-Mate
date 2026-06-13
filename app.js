import { StockfishEngine, STOCKFISH_LEVELS } from "./engine.js";
import {
  initAudio,
  playCapture,
  playCheck,
  playGameOver,
  playIllegal,
  playMove,
  playStart,
  playToggle,
  setSoundEnabled,
} from "./audio.js";
import { renderPiece } from "./pieces.js";

function pieceMarkup(piece) {
  if (!piece) return "";
  const pieceClass = `${piece.color === "w" ? "white" : "black"}-piece`;
  return `<span class="piece ${pieceClass}" data-piece="${piece.type}">${renderPiece(piece)}</span>`;
}

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
  1: { label: "Разминка", depth: 1, randomness: 0.32, blunder: 0.18 },
  2: { label: "Классика", depth: 2, randomness: 0.16, blunder: 0.06 },
  3: { label: "Стратегия", depth: 2, randomness: 0.07, blunder: 0.01 },
  4: { label: "Эксперт", depth: 3, randomness: 0.025, blunder: 0.00 },
  5: { label: "BORK Mode", depth: 4, randomness: 0.00, blunder: 0.00 },
};

const OPENING_BOOK = [
  { moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3"], name: "Сицилианская защита", idea: "Чёрные сразу борются за центр с фланга. Белым важно развиваться, контролировать d4 и не спешить с необоснованной атакой." },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"], name: "Испанская партия", idea: "Белые давят на коня c6 и пешку e5. Главная тема — центр, рокировка и постепенное усиление фигур." },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"], name: "Итальянская партия", idea: "Белые целятся в слабое поле f7. Развивайте фигуры, рокируйте и готовьте d2-d4 или c2-c3." },
  { moves: ["d4", "d5", "c4"], name: "Ферзевый гамбит", idea: "Белые предлагают пешку, чтобы захватить центр. Важны развитие лёгких фигур и давление по линии c." },
  { moves: ["d4", "Nf6", "c4", "g6"], name: "Староиндийская защита", idea: "Чёрные отдают белым пространство, но готовят контрудар по центру и королевскому флангу." },
  { moves: ["e4", "e6"], name: "Французская защита", idea: "Чёрные укрепляют d5 и принимают стеснённую, но прочную структуру. Следите за цепью пешек и слабым слоном c8." },
  { moves: ["e4", "c6"], name: "Защита Каро-Канн", idea: "Чёрные готовят d5 без запирания слона c8. План — крепкая структура и аккуратная контригра." },
  { moves: ["e4", "d5"], name: "Скандинавская защита", idea: "Чёрные немедленно атакуют e4. Белым обычно выгодно выиграть темп на ферзе и быстро развиваться." },
];

const TACTICS = [
  { title: "Связка", text: "Фигура ограничена, потому что за ней король или более ценная фигура. Ищите линии слонов, ладей и ферзя." },
  { title: "Вилка", text: "Одна фигура атакует две цели сразу. Чаще всего вилки делают кони, ферзь и пешки." },
  { title: "Открытое нападение", text: "Фигура уходит и открывает линию другой фигуре. Особенно опасно, если появляется шах или атака ферзя." },
  { title: "Двойной шах", text: "Король получает шах сразу от двух фигур. Обычно отвечать можно только ходом короля." },
  { title: "Отвлечение", text: "Защитника вынуждают уйти с важной задачи: защиты мата, ферзя или ключевого поля." },
  { title: "Завлечение", text: "Соперника заманивают на неудачное поле, где он попадает под удар или матовую сеть." },
  { title: "Перегрузка", text: "Одна фигура защищает слишком много объектов. Удар по одному объекту рушит всю оборону." },
  { title: "Матовая сеть", text: "Не просто шах, а ограничение всех путей короля. Проверяйте поля бегства перед жертвой." },
];

const STRATEGIES = {
  center: "Контролируйте центр пешками и фигурами — так у фигур появляется больше маршрутов.",
  king: "Сначала безопасность короля: рокировка, отсутствие открытых линий рядом и минимум слабых полей.",
  attack: "Атака работает, когда фигур у цели больше, чем защитников. Подведите фигуры до жертвы.",
  endgame: "В эндшпиле активный король и проходные пешки важнее красивых шахов."
};

let ChessCtor = null;
let game = null;
let selectedSquare = null;
let legalTargets = [];
let playerColor = "w";
let gameMode = "ai";
let autoFlip = true;
let boardOrientation = "w";
let difficulty = 1;
let botThinking = false;
let lastMove = null;
let lastMoveBy = null;
let gameStarted = false;
let gameResultSaved = false;
let noviceMode = false;
let hintsMode = false;
let tacticIndex = 0;
let pieceStyle = "bork";
let activeStrategy = "center";
let activeExperience = "free";
let lastMoveAdvice = "";
let qualityStats = { brilliant: 0, strong: 0, weak: 0, missed: 0 };
let boardAlertTimer = null;
let stockfishEngine = null;
let stockfishReady = false;
let soundEnabled = true;
let voiceEnabled = false;
let pendingPromotion = null;
let illegalSquare = null;
let illegalTimer = null;
let activeSheetTab = "moves";
let coachDetail = false;

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
  hintBtn: document.querySelector("#hintBtn"),
  drawBtn: document.querySelector("#drawBtn"),
  resignBtn: document.querySelector("#resignBtn"),
  moveList: document.querySelector("#moveList"),
  fenBox: document.querySelector("#fenBox"),
  toast: document.querySelector("#toast"),
  copyPgnBtn: document.querySelector("#copyPgnBtn"),
  noviceModeToggle: document.querySelector("#noviceModeToggle"),
  autoFlipToggle: document.querySelector("#autoFlipToggle"),
  soundToggle: document.querySelector("#soundToggle"),
  voiceToggle: document.querySelector("#voiceToggle"),
  hintsModeToggle: document.querySelector("#hintsModeToggle"),
  pieceStyleBtn: document.querySelector("#pieceStyleBtn"),
  coachPanel: document.querySelector("#coachPanel"),
  coachText: document.querySelector("#coachText"),
  coachIdeaBtn: document.querySelector("#coachIdeaBtn"),
  coachSpeakBtn: document.querySelector("#coachSpeakBtn"),
  coachMoreBtn: document.querySelector("#coachMoreBtn"),
  coachTags: document.querySelector("#coachTags"),
  openingBadge: document.querySelector("#openingBadge"),
  nextTacticBtn: document.querySelector("#nextTacticBtn"),
  tacticTitle: document.querySelector("#tacticTitle"),
  tacticText: document.querySelector("#tacticText"),
  tacticsPanel: document.querySelector("#tacticsPanel"),
  tacticLibrary: document.querySelector("#tacticLibrary"),
  strategyText: document.querySelector("#strategyText"),
  qualityStats: document.querySelector("#qualityStats"),
  brilliantMoves: document.querySelector("#brilliantMoves"),
  strongMoves: document.querySelector("#strongMoves"),
  weakMoves: document.querySelector("#weakMoves"),
  missedMoves: document.querySelector("#missedMoves"),
  boardAlert: document.querySelector("#boardAlert"),
  resultModal: document.querySelector("#resultModal"),
  resultTitle: document.querySelector("#resultTitle"),
  resultSummary: document.querySelector("#resultSummary"),
  resultMoves: document.querySelector("#resultMoves"),
  resultLevel: document.querySelector("#resultLevel"),
  resultColor: document.querySelector("#resultColor"),
  resultNewBtn: document.querySelector("#resultNewBtn"),
  resultPgnBtn: document.querySelector("#resultPgnBtn"),
  resultCloseBtn: document.querySelector("#resultCloseBtn"),
  promotionModal: document.querySelector("#promotionModal"),
  mobileMenuBtn: document.querySelector("#mobileMenuBtn"),
  mobileMenuActionBtn: document.querySelector("#mobileMenuActionBtn"),
  openSettingsLink: document.querySelector("#openSettingsLink"),
  menuNewGameBtn: document.querySelector("#menuNewGameBtn"),
  menuResignBtn: document.querySelector("#menuResignBtn"),
  menuFlipBtn: document.querySelector("#menuFlipBtn"),
  menuCopyPgnBtn: document.querySelector("#menuCopyPgnBtn"),
  menuSpeakBtn: document.querySelector("#menuSpeakBtn"),
  sidePanel: document.querySelector("#sidePanel"),
  sheetCloseBtn: document.querySelector("#sheetCloseBtn"),
  experienceGrid: document.querySelector("#experienceGrid"),
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

function getPvpStats() {
  try {
    return JSON.parse(localStorage.getItem("borkChessPvpStats")) || { white: 0, black: 0, draws: 0 };
  } catch {
    return { white: 0, black: 0, draws: 0 };
  }
}

function setPvpStats(stats) {
  localStorage.setItem("borkChessPvpStats", JSON.stringify(stats));
  renderStats();
}

function saveSettings() {
  localStorage.setItem("borkChessSettings", JSON.stringify({ gameMode, playerColor, difficulty, boardOrientation, autoFlip, pieceStyle, soundEnabled, voiceEnabled, activeExperience }));
}

function loadSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem("borkChessSettings"));
    if (!settings) return;
    gameMode = settings.gameMode || gameMode;
    playerColor = settings.playerColor || playerColor;
    difficulty = Number(settings.difficulty || difficulty);
    autoFlip = settings.autoFlip ?? autoFlip;
    soundEnabled = settings.soundEnabled ?? soundEnabled;
    voiceEnabled = settings.voiceEnabled ?? voiceEnabled;
    activeExperience = settings.activeExperience || activeExperience;
    pieceStyle = settings.pieceStyle || pieceStyle;
  } catch {}
}

function syncSettingsUi() {
  document.querySelectorAll("[data-game-mode]").forEach(button => button.classList.toggle("active", button.dataset.gameMode === gameMode));
  document.querySelectorAll("[data-color]").forEach(button => button.classList.toggle("active", button.dataset.color === playerColor));
  document.querySelectorAll("[data-level]").forEach(button => button.classList.toggle("active", Number(button.dataset.level) === difficulty));
  el.autoFlipToggle.checked = autoFlip;
  el.soundToggle.checked = soundEnabled;
  el.voiceToggle.checked = voiceEnabled;
  setSoundEnabled(soundEnabled);
  document.querySelectorAll("[data-experience]").forEach(button => button.classList.toggle("active", button.dataset.experience === activeExperience));
  pieceStyle = "bork";
  document.body.classList.add("bork-pieces");
  document.body.classList.remove("classic-pieces");
  el.pieceStyleBtn.textContent = "Фигуры: BORK SVG";
}

function setStats(stats) {
  localStorage.setItem("borkChessStats", JSON.stringify(stats));
  renderStats();
}

function resetQualityStats() {
  qualityStats = { brilliant: 0, strong: 0, weak: 0, missed: 0 };
  renderQualityStats();
}

function renderQualityStats() {
  if (!el.qualityStats) return;
  el.qualityStats.classList.toggle("hidden", difficulty === 5);
  el.brilliantMoves.textContent = qualityStats.brilliant;
  el.strongMoves.textContent = qualityStats.strong;
  el.weakMoves.textContent = qualityStats.weak;
  el.missedMoves.textContent = qualityStats.missed;
}

function isNoviceLevel() {
  return Number(difficulty) === 1;
}

function showBoardAlert(message, tone = "accent") {
  if (!el.boardAlert || !message) return;
  window.clearTimeout(boardAlertTimer);
  el.boardAlert.textContent = message;
  el.boardAlert.className = `board-alert show ${tone}`;
  boardAlertTimer = window.setTimeout(() => el.boardAlert.classList.remove("show"), 1800);
}

function renderStats() {
  if (gameMode === "pvp") {
    const stats = getPvpStats();
    el.wins.textContent = stats.white;
    el.losses.textContent = stats.black;
    el.draws.textContent = stats.draws;
    return;
  }

  const stats = getStats();
  el.wins.textContent = stats.wins;
  el.losses.textContent = stats.losses;
  el.draws.textContent = stats.draws;
}

function applyExperienceState() {
  document.body.classList.toggle("experience-free", activeExperience === "free");
  document.body.classList.toggle("experience-coach", activeExperience === "coach");
  document.body.classList.toggle("experience-combo", activeExperience === "combo");
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
      last && lastMoveBy === "bot" ? "opponent-move" : "",
      illegalSquare === square ? "illegal-flash" : "",
      check ? "check" : "",
    ].filter(Boolean).join(" ");

    return `<button class="${classes}" data-square="${square}" aria-label="${square}">
      ${pieceMarkup(piece)}
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
  updateCoach();

  el.undoBtn.disabled = !gameStarted || !isNoviceLevel() || botThinking || game.history().length === 0;
  document.body.classList.toggle("ai-thinking", botThinking);
  renderSheet();
  renderQualityStats();
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
  if (gameMode === "pvp") return game.turn() === "w" ? "Ход белых" : "Ход чёрных";
  return game.turn() === playerColor ? "Ваш ход" : "Ход AI";
}

function normalizeMove(move) {
  if (!move) return null;
  if (typeof move === "string") return move;
  return { from: move.from, to: move.to, promotion: move.promotion || "q" };
}

function makeMove(move, actor = "player") {
  const result = game.move(normalizeMove(move));
  if (result) {
    if (result.captured) playCapture();
    else playMove();
    lastMove = { from: result.from, to: result.to };
    lastMoveBy = actor;
    selectedSquare = null;
    legalTargets = [];
    renderBoard();
    announcePositionState();
    checkResultAndSave();
  }
  return result;
}

function announcePositionState() {
  if (!gameStarted) return;
  if (isCheckmate()) {
    showBoardAlert("МАТ", "danger");
    playGameOver();
    speakCoach("Мат. Партия завершена.");
  } else if (isCheck()) {
    showBoardAlert("ШАХ", "accent");
    playCheck();
    speakCoach("Шах. Проверьте безопасность короля.");
  }
}

function showResultModal(title, summary) {
  if (!el.resultModal) return;
  el.resultTitle.textContent = title;
  el.resultSummary.textContent = summary;
  el.resultMoves.textContent = Math.ceil(game.history().length / 2);
  el.resultLevel.textContent = gameMode === "pvp" ? "Два игрока" : LEVELS[difficulty].label;
  el.resultColor.textContent = playerColor === "w" ? "Белые" : "Чёрные";
  el.resultModal.classList.add("show");
  el.resultModal.setAttribute("aria-hidden", "false");
}

function closeResultModal() {
  el.resultModal?.classList.remove("show");
  el.resultModal?.setAttribute("aria-hidden", "true");
}

function renderSheet() {
  document.querySelectorAll("[data-sheet-tab]").forEach(button => button.classList.toggle("active", button.dataset.sheetTab === activeSheetTab));
  document.querySelectorAll("[data-sheet-panel]").forEach(panel => panel.classList.toggle("sheet-active", panel.dataset.sheetPanel === activeSheetTab));
}

function speakCoach(text = el.coachText?.textContent || "", force = false) {
  if (!voiceEnabled || !force || !text || !("speechSynthesis" in window)) return;
  const clean = text.replace(/\s+/g, " ").slice(0, 180);
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "ru-RU";
  utterance.rate = 0.92;
  utterance.pitch = 0.86;
  utterance.volume = 0.72;
  window.speechSynthesis.speak(utterance);
}

function flashIllegal(square) {
  illegalSquare = square;
  playIllegal();
  window.clearTimeout(illegalTimer);
  renderBoard();
  illegalTimer = window.setTimeout(() => {
    illegalSquare = null;
    renderBoard();
  }, 260);
}

function checkResultAndSave() {
  if (!gameStarted || gameResultSaved || !isGameOver()) return;

  gameResultSaved = true;
  const stats = getStats();

  if (gameMode === "pvp") {
    const pvpStats = getPvpStats();
    if (isDraw() || isStalemate()) {
      pvpStats.draws += 1;
      showResultModal(isStalemate() ? "Пат. Ничья." : "Баланс сохранён.", "Партия завершена без победителя.");
    } else if (isCheckmate()) {
      const winnerColor = game.turn() === "w" ? "b" : "w";
      pvpStats[winnerColor === "w" ? "white" : "black"] += 1;
      showResultModal("Мат.", `Победа: ${winnerColor === "w" ? "белые" : "чёрные"}.`);
    }
    setPvpStats(pvpStats);
    return;
  }

  if (isDraw() || isStalemate()) {
    stats.draws += 1;
    showResultModal(isStalemate() ? "Пат. Ничья." : "Баланс сохранён.", "Партия завершена без победителя.");
  } else if (isCheckmate()) {
    const winnerColor = game.turn() === "w" ? "b" : "w";
    if (winnerColor === playerColor) {
      stats.wins += 1;
      showResultModal("Партия завершена. Победа.", "Мат. Расчёт реализован.");
    } else {
      stats.losses += 1;
      showResultModal("Партия завершена. Позиция уступлена.", "Мат. Инициатива перешла к сопернику.");
    }
  }

  setStats(stats);
}

function handleSquareClick(square) {
  if (!gameStarted || botThinking || isGameOver()) return;
  const activeColor = gameMode === "pvp" ? game.turn() : playerColor;
  if (game.turn() !== activeColor) return;

  const piece = getPiece(square);
  const clickedOwnPiece = piece && piece.color === activeColor;

  if (selectedSquare && isLegalTarget(square)) {
    const promotionMoves = legalTargets.filter(item => item.to === square && item.promotion);
    if (promotionMoves.length > 1) {
      showPromotionPicker(promotionMoves);
      return;
    }
    completePlayerMove(legalTargets.find(item => item.to === square));
    return;
  }

  if (clickedOwnPiece) {
    selectedSquare = square;
    legalTargets = game.moves({ square, verbose: true });
    renderBoard();
    return;
  }

  if (piece || selectedSquare) flashIllegal(square);
  selectedSquare = null;
  legalTargets = [];
  renderBoard();
}

function renderPromotionPieces() {
  el.promotionModal?.querySelectorAll("[data-promotion]").forEach(button => {
    const type = button.dataset.promotion;
    const label = button.querySelector("span")?.outerHTML || "";
    button.innerHTML = `${renderPiece({ color: game?.turn?.() || playerColor || "w", type })}${label}`;
  });
}

function showPromotionPicker(moves) {
  pendingPromotion = moves;
  renderPromotionPieces();
  el.promotionModal?.classList.add("show");
  el.promotionModal?.setAttribute("aria-hidden", "false");
}

function closePromotionPicker() {
  pendingPromotion = null;
  el.promotionModal?.classList.remove("show");
  el.promotionModal?.setAttribute("aria-hidden", "true");
}

function completePlayerMove(move) {
  const movingColor = game.turn();
  const moveReview = difficulty === 5 ? { message: "" } : reviewPlayerMove(move, movingColor);
  lastMoveAdvice = isNoviceLevel() ? moveReview.message : "";
  const result = makeMove(move, "player");
  if (moveReview.kind === "weak" || moveReview.kind === "missed") speakCoach(moveReview.message);
  if (result && !isGameOver()) {
    if (gameMode === "ai") {
      window.setTimeout(botMove, 260);
    } else if (autoFlip) {
      boardOrientation = game.turn();
      renderBoard();
    }
  }
}

function scoreMovesFor(color, depth = 1) {
  return game.moves({ verbose: true }).map(move => ({
    move,
    score: evaluateMove(move, color, depth),
  })).sort((a, b) => b.score - a.score);
}

function reviewPlayerMove(move, color = playerColor) {
  const scored = scoreMovesFor(color, Math.min(2, LEVELS[difficulty].depth));
  const best = scored[0];
  const played = scored.find(item => item.move.from === move.from && item.move.to === move.to && (item.move.promotion || "q") === (move.promotion || "q"));

  if (!best || !played) return { kind: "strong", message: "" };

  const loss = best.score - played.score;
  if (loss < 12) {
    qualityStats.brilliant += 1;
    return { kind: "brilliant", message: `Великолепно: ${move.san} — ${moveReason(move)}.` };
  }
  if (loss < 45) {
    qualityStats.strong += 1;
    return { kind: "strong", message: `Сильно: ${move.san} — ${moveReason(move)}.` };
  }
  if (loss < 110) {
    qualityStats.missed += 1;
    return { kind: "missed", message: `Упущено: ${move.san}. Лучше ${best.move.san} — ${moveReason(best.move)}.` };
  }
  qualityStats.weak += 1;
  return { kind: "weak", message: `Слабо: ${move.san}. Лучше ${best.move.san} — ${moveReason(best.move)}.` };
}

function explainPlayerMove(move) {
  return reviewPlayerMove(move).message;
}

function getOpeningMatch() {
  const history = game.history();
  let best = null;

  for (const opening of OPENING_BOOK) {
    const matches = history.length > 0
      && history.length <= opening.moves.length
      && history.every((move, index) => opening.moves[index] === move);
    if (matches && (!best || history.length > best.matchedMoves)) {
      best = { ...opening, matchedMoves: history.length };
    }
  }

  return best;
}

function materialSummary() {
  let score = 0;
  for (const row of game.board()) {
    for (const piece of row) {
      if (!piece) continue;
      score += piece.color === playerColor ? PIECE_VALUE[piece.type] : -PIECE_VALUE[piece.type];
    }
  }
  if (Math.abs(score) < 80) return "Материал примерно равен.";
  return score > 0 ? "У вас материальный перевес — упрощайте и не отдавайте короля." : "Материала меньше — ищите активность, шахи и тактические ресурсы.";
}

function moveReason(move) {
  if (!move) return "улучшает позицию";
  if (move.san.includes("#")) return "матовая атака";
  if (move.san.includes("+")) return "шах с темпом";
  if (move.captured) return `выигрыш/размен на ${move.to}`;
  if (["n", "b"].includes(move.piece) && ["1", "8"].includes(move.from[1])) return "развитие фигуры";
  if (["e4", "d4", "e5", "d5", "c4", "c5"].includes(move.to)) return "контроль центра";
  if (move.san === "O-O" || move.san === "O-O-O") return "безопасность короля";
  return "активность без явной слабости";
}

function bestCandidateText() {
  if (!gameStarted || game.turn() !== playerColor || isGameOver()) return "";

  const best = scoreMovesFor(playerColor, 1)[0];
  if (!best) return "";

  return `Кандидат: ${best.move.san} — ${moveReason(best.move)}.`;
}

function updateCoach() {
  if (!el.coachText || !game) return;

  const opening = getOpeningMatch();
  el.openingBadge.textContent = opening ? opening.name : "План";
  el.coachPanel.classList.toggle("is-muted", !hintsMode);

  if (!isNoviceLevel() && activeExperience === "free" && !hintsMode) {
    el.coachText.textContent = "";
    return;
  }

  if (!hintsMode && activeExperience === "free") {
    el.coachText.textContent = "Подсказки выключены — партия остаётся чистой.";
    return;
  }

  if (!gameStarted) {
    el.coachText.textContent = "Стартуйте партию — тренер даст только короткие решения по позиции.";
    return;
  }

  const activeSide = gameMode === "pvp" ? (game.turn() === "w" ? "Ход белых." : "Ход чёрных.") : (game.turn() === playerColor ? "Ваш ход." : "Ход AI.");
  const checks = isCheck() ? "Шах: сначала защитите короля." : "";
  const openingText = opening ? `${opening.name}: ${opening.idea}` : "План: король в безопасности, фигуры активны, центр под контролем.";
  const experienceText = activeExperience === "combo" ? "Ищите форсировку: шах → взятие → угроза." : activeExperience === "coach" ? "Оцениваем качество решения." : "";
  const strategyText = STRATEGIES[activeStrategy] || "";
  const noviceText = noviceMode ? `${materialSummary()} Проверка: шахи, взятия, угрозы.` : "";
  const candidateText = bestCandidateText();
  const core = [checks || activeSide, lastMoveAdvice || candidateText || strategyText].filter(Boolean);
  const parts = coachDetail ? [openingText, activeSide, checks, experienceText, strategyText, noviceText, lastMoveAdvice, candidateText].filter(Boolean) : core;

  el.coachText.textContent = parts.join(" ");
  el.coachTags.innerHTML = [opening?.name || "План", activeStrategy === "king" ? "Защита короля" : "Центр", activeExperience === "combo" ? "Тактика" : "Развитие"].map(tag => `<span>${tag}</span>`).join("");
  el.coachMoreBtn.textContent = coachDetail ? "Кратко" : "Подробнее";
}

function renderTactic() {
  const tactic = TACTICS[tacticIndex % TACTICS.length];
  el.tacticTitle.textContent = tactic.title;
  el.tacticText.textContent = tactic.text;

  if (el.tacticLibrary) {
    el.tacticLibrary.querySelectorAll("button").forEach((button, index) => {
      button.classList.toggle("active", index === tacticIndex % TACTICS.length);
    });
  }
}

function renderTacticLibrary() {
  if (!el.tacticLibrary) return;

  el.tacticLibrary.innerHTML = TACTICS.map((tactic, index) => `
    <button class="tactic-chip ${index === tacticIndex ? "active" : ""}" data-tactic-index="${index}">
      ${tactic.title}
    </button>
  `).join("");

  el.tacticLibrary.querySelectorAll("[data-tactic-index]").forEach(button => {
    button.addEventListener("click", () => {
      tacticIndex = Number(button.dataset.tacticIndex);
      renderTactic();
    });
  });
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
  score += game.turn() === "w" ? mobility * 2 : -mobility * 2;

  if (isCheck()) {
    score += game.turn() === "w" ? -35 : 35;
  }

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

function chooseBookMove() {
  const history = game.history();

  for (const opening of OPENING_BOOK) {
    const canContinue = history.every((move, index) => opening.moves[index] === move);
    const nextMove = opening.moves[history.length];
    if (canContinue && nextMove) {
      return nextMove;
    }
  }

  return null;
}

function chooseBotMove() {
  const config = LEVELS[difficulty];
  const moves = game.moves({ verbose: true });
  const botColor = game.turn();

  if (!moves.length) return null;

  const bookMove = difficulty >= 2 ? chooseBookMove() : null;
  if (bookMove && moves.some(move => move.san === bookMove)) {
    return bookMove;
  }

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

function uciToMove(uci) {
  if (!uci || uci.length < 4) return null;
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || "q" };
}

async function botMove() {
  if (!gameStarted || gameMode !== "ai" || isGameOver() || game.turn() === playerColor) return;

  botThinking = true;
  el.engineStatus.textContent = stockfishReady ? "AI анализирует позицию" : "Fallback AI";
  renderBoard();

  await new Promise(resolve => setTimeout(resolve, 180));

  let move = null;
  if (stockfishReady) {
    try {
      move = uciToMove(await stockfishEngine.bestMove(game.fen(), difficulty));
    } catch (error) {
      console.warn(error);
      stockfishReady = false;
      el.engineStatus.textContent = "Fallback AI";
    }
  }
  if (!move) move = chooseBotMove();
  if (move) {
    makeMove(move, "bot");
  }

  botThinking = false;
  renderBoard();
}

function returnToSetup() {
  if (gameStarted && !isGameOver() && !window.confirm("Текущая партия будет остановлена. Продолжить?")) return;
  gameStarted = false;
  botThinking = false;
  selectedSquare = null;
  legalTargets = [];
  lastMove = null;
  lastMoveBy = null;
  lastMoveAdvice = "";
  document.body.classList.remove("game-active", "novice-active", "pvp-active");
  if (game) renderBoard();
  toast("Выберите настройки новой партии");
}

function startGame(options = {}) {
  playerColor = options.color || playerColor;
  difficulty = Number(options.level || difficulty);
  boardOrientation = gameMode === "pvp" ? "w" : playerColor;
  game = new ChessCtor();
  gameStarted = true;
  gameResultSaved = false;
  resetQualityStats();
  selectedSquare = null;
  legalTargets = [];
  lastMove = null;
  lastMoveBy = null;
  lastMoveAdvice = "";

  document.querySelectorAll("[data-color]").forEach(button => {
    button.classList.toggle("active", button.dataset.color === playerColor);
  });

  document.querySelectorAll("[data-level]").forEach(button => {
    button.classList.toggle("active", Number(button.dataset.level) === difficulty);
  });

  hintsMode = isNoviceLevel();
  noviceMode = isNoviceLevel();
  el.hintsModeToggle.checked = hintsMode;
  el.noviceModeToggle.checked = noviceMode;
  saveSettings();
  document.body.classList.add("game-active");
  document.body.classList.toggle("pvp-active", gameMode === "pvp");
  document.body.classList.toggle("novice-active", isNoviceLevel());
  playStart();
  toast(`Партия началась: ${LEVELS[difficulty].label}`);
  if (activeExperience !== "free") speakCoach("Тренировка началась. Сначала безопасность короля, затем центр и активность фигур.");
  renderBoard();

  if (gameMode === "ai" && playerColor === "b") {
    window.setTimeout(botMove, 400);
  }
}

function undoMove() {
  if (!gameStarted || botThinking) return;

  if (game.history().length === 0) return;

  if (gameMode === "pvp") {
    game.undo();
  } else if (game.turn() === playerColor) {
    game.undo();
    if (game.history().length) game.undo();
  } else {
    game.undo();
  }

  if (gameMode === "pvp" && autoFlip) boardOrientation = game.turn();
  const history = game.history({ verbose: true });
  lastMove = history.length ? { from: history.at(-1).from, to: history.at(-1).to } : null;
  lastMoveBy = null;
  gameResultSaved = false;
  resetQualityStats();
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
      playerColor = button.dataset.color === "random" ? (Math.random() > 0.5 ? "w" : "b") : button.dataset.color;
      playToggle();
      document.querySelectorAll("[data-color]").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
    });
  });

  document.querySelectorAll("[data-level]").forEach(button => {
    button.addEventListener("click", () => {
      difficulty = Number(button.dataset.level);
      playToggle();
      document.querySelectorAll("[data-level]").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
    });
  });

  document.addEventListener("pointerdown", initAudio, { once: true });
  el.startBtn.addEventListener("click", () => startGame());
  el.demoBtn.addEventListener("click", () => startGame({ color: "w", level: 2 }));
  el.newGameBtn.addEventListener("click", returnToSetup);
  el.undoBtn.addEventListener("click", undoMove);
  document.querySelectorAll("[data-game-mode]").forEach(button => {
    button.addEventListener("click", () => {
      gameMode = button.dataset.gameMode;
      playToggle();
      document.querySelectorAll("[data-game-mode]").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelectorAll("[data-experience-short]").forEach(item => item.classList.remove("active"));
      saveSettings();
      renderStats();
    });
  });
  el.autoFlipToggle.addEventListener("change", () => {
    autoFlip = el.autoFlipToggle.checked;
    playToggle();
    saveSettings();
  });
  el.soundToggle.addEventListener("change", () => {
    soundEnabled = el.soundToggle.checked;
    setSoundEnabled(soundEnabled);
    playToggle();
    saveSettings();
  });
  el.voiceToggle.addEventListener("change", () => {
    voiceEnabled = el.voiceToggle.checked;
    if (voiceEnabled && !("speechSynthesis" in window)) toast("Голос тренера не поддерживается браузером");
    else if (voiceEnabled) toast("Голос тренера включён: используйте кнопку Озвучить совет.");
    saveSettings();
  });
  el.drawBtn.addEventListener("click", () => {
    if (gameMode === "pvp" && gameStarted && window.confirm("Согласовать ничью?")) {
      gameResultSaved = true;
      const pvpStats = getPvpStats();
      pvpStats.draws += 1;
      setPvpStats(pvpStats);
      showResultModal("Баланс сохранён.", "Ничья по соглашению.");
    }
  });
  el.resignBtn.addEventListener("click", () => {
    if (!gameStarted || !window.confirm("Сдаться в текущей партии?")) return;
    gameResultSaved = true;
    showResultModal("Партия завершена. Позиция уступлена.", gameMode === "pvp" ? "Партия завершена сдачей." : "Вы выбрали завершить игру.");
  });
  el.resultNewBtn.addEventListener("click", () => { closeResultModal(); returnToSetup(); });
  el.resultPgnBtn.addEventListener("click", copyPgn);
  el.resultCloseBtn.addEventListener("click", closeResultModal);
  el.promotionModal?.querySelectorAll("[data-promotion]").forEach(button => {
    button.addEventListener("click", () => {
      const move = pendingPromotion?.find(item => item.promotion === button.dataset.promotion);
      closePromotionPicker();
      if (move) completePlayerMove(move);
    });
  });
  const openMenu = () => { activeSheetTab = "settings"; el.sidePanel?.classList.add("open"); el.sidePanel?.setAttribute("aria-hidden", "false"); renderSheet(); };
  const closeMenu = () => { el.sidePanel?.classList.remove("open"); el.sidePanel?.setAttribute("aria-hidden", "true"); };
  el.mobileMenuBtn?.addEventListener("click", openMenu);
  el.mobileMenuActionBtn?.addEventListener("click", openMenu);
  el.openSettingsLink?.addEventListener("click", openMenu);
  el.sheetCloseBtn?.addEventListener("click", closeMenu);
  document.querySelectorAll("[data-sheet-tab]").forEach(button => button.addEventListener("click", () => {
    activeSheetTab = button.dataset.sheetTab;
    el.sidePanel?.classList.add("open");
    renderSheet();
  }));
  el.hintBtn?.addEventListener("click", () => { hintsMode = true; coachDetail = false; updateCoach(); showBoardAlert(el.coachText.textContent || "Проверьте шахи, взятия и угрозы. Сейчас важен контроль центра.", "info"); renderSheet(); });
  el.coachIdeaBtn?.addEventListener("click", () => { coachDetail = true; updateCoach(); speakCoach(el.coachText.textContent); });
  el.coachSpeakBtn?.addEventListener("click", () => speakCoach(el.coachText.textContent, true));
  el.coachMoreBtn?.addEventListener("click", () => { coachDetail = !coachDetail; updateCoach(); });
  el.flipBtn.addEventListener("click", () => {
    boardOrientation = boardOrientation === "w" ? "b" : "w";
    renderBoard();
  });
  el.copyPgnBtn?.addEventListener("click", copyPgn);
  el.menuCopyPgnBtn?.addEventListener("click", copyPgn);
  el.menuNewGameBtn?.addEventListener("click", () => { closeMenu(); returnToSetup(); });
  el.menuResignBtn?.addEventListener("click", () => { closeMenu(); el.resignBtn?.click(); });
  el.menuFlipBtn?.addEventListener("click", () => { closeMenu(); el.flipBtn?.click(); });
  el.menuSpeakBtn?.addEventListener("click", () => { updateCoach(); speakCoach(el.coachText.textContent, true); });
  el.hintsModeToggle.addEventListener("change", () => {
    hintsMode = el.hintsModeToggle.checked;
    updateCoach();
    toast(hintsMode ? "Подсказки тренера включены" : "Подсказки тренера выключены");
  });
  el.noviceModeToggle.addEventListener("change", () => {
    noviceMode = el.noviceModeToggle.checked;
    updateCoach();
    toast(noviceMode ? "Подробные объяснения включены" : "Подробные объяснения выключены");
  });
  el.pieceStyleBtn.addEventListener("click", () => {
    pieceStyle = "bork";
    playToggle();
    document.body.classList.add("bork-pieces");
    document.body.classList.remove("classic-pieces");
    el.pieceStyleBtn.textContent = "Фигуры: BORK SVG";
    saveSettings();
    renderBoard();
  });
  document.querySelectorAll("[data-experience]").forEach(button => {
    button.addEventListener("click", () => {
      activeExperience = button.dataset.experience;
      playToggle();
      applyExperienceState();
      document.querySelectorAll("[data-experience]").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      if (activeExperience !== "free") {
        hintsMode = true;
        el.hintsModeToggle.checked = true;
      }
      if (activeExperience === "combo") {
        noviceMode = true;
        el.noviceModeToggle.checked = true;
        tacticIndex = 0;
        renderTactic();
      }
      updateCoach();
      saveSettings();
    });
  });
  document.querySelectorAll("[data-experience-short]").forEach(button => {
    button.addEventListener("click", () => {
      gameMode = "ai";
      activeExperience = button.dataset.experienceShort;
      hintsMode = true;
      el.hintsModeToggle.checked = true;
      document.querySelectorAll("[data-game-mode]").forEach(item => item.classList.toggle("active", item.dataset.gameMode === "ai"));
      document.querySelectorAll("[data-experience-short]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-experience]").forEach(item => item.classList.toggle("active", item.dataset.experience === activeExperience));
      applyExperienceState();
      updateCoach();
      saveSettings();
    });
  });
  document.querySelectorAll("[data-strategy]").forEach(button => {
    button.addEventListener("click", () => {
      activeStrategy = button.dataset.strategy;
      document.querySelectorAll("[data-strategy]").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      el.strategyText.textContent = STRATEGIES[activeStrategy];
      updateCoach();
    });
  });
  el.nextTacticBtn.addEventListener("click", () => {
    tacticIndex += 1;
    renderTactic();
  });
}

async function init() {
  loadSettings();
  syncSettingsUi();
  renderStats();
  applyExperienceState();
  renderTacticLibrary();
  renderTactic();
  renderPromotionPieces();
  el.strategyText.textContent = STRATEGIES[activeStrategy];
  initInteractions();

  try {
    await loadChess();
    game = new ChessCtor();
    el.engineStatus.textContent = "Правила готовы";
    el.engineStatus.classList.add("ready");
    renderBoard();

    try {
      stockfishEngine = new StockfishEngine({ onStatus: (status) => { el.engineStatus.textContent = status; } });
      await stockfishEngine.init();
      stockfishReady = true;
      el.engineStatus.textContent = "Stockfish готов";
    } catch (engineError) {
      console.warn(engineError);
      stockfishReady = false;
      el.engineStatus.textContent = "Fallback AI";
    }
  } catch (error) {
    console.error(error);
    el.engineStatus.textContent = "Ошибка загрузки";
    el.engineStatus.classList.add("error");
    el.gameStatus.textContent = "Нужен доступ к CDN";
    toast("Не удалось загрузить шахматную библиотеку. Проверьте интернет или CDN.");
  }
}

init();


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(error => console.warn("Service worker failed:", error));
  });
}
