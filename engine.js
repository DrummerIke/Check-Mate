export const STOCKFISH_LEVELS = {
  1: { skill: 2, depth: 4, movetime: 180, label: "Разминка" },
  2: { skill: 6, depth: 7, movetime: 320, label: "Классика" },
  3: { skill: 10, depth: 10, movetime: 520, label: "Стратегия" },
  4: { skill: 15, depth: 13, movetime: 850, label: "Эксперт" },
  5: { skill: 20, depth: 16, movetime: 1300, label: "BORK Mode" },
};

export class StockfishEngine {
  constructor({ onStatus } = {}) {
    this.onStatus = onStatus || (() => {});
    this.worker = null;
    this.ready = false;
    this.pending = null;
  }

  init() {
    return new Promise((resolve, reject) => {
      this.worker = new Worker(new URL("./stockfish-worker.js", import.meta.url), { type: "classic" });
      const timeout = window.setTimeout(() => reject(new Error("Stockfish timeout")), 8000);

      this.worker.onmessage = (event) => {
        const data = String(event.data || "");
        if (data.startsWith("status:")) this.onStatus(data.replace("status:", ""));
        if (data === "readyok") {
          this.ready = true;
          window.clearTimeout(timeout);
          resolve();
        }
        if (data.startsWith("bestmove") && this.pending) {
          const bestMove = data.split(" ")[1];
          const pending = this.pending;
          this.pending = null;
          pending.resolve(bestMove && bestMove !== "(none)" ? bestMove : null);
        }
        if (data.startsWith("error:")) {
          window.clearTimeout(timeout);
          reject(new Error(data.replace("error:", "")));
        }
      };

      this.worker.onerror = (error) => {
        window.clearTimeout(timeout);
        reject(error instanceof Error ? error : new Error("Stockfish worker error"));
      };

      this.post("uci");
      this.post("isready");
    });
  }

  post(command) {
    this.worker?.postMessage(command);
  }

  async bestMove(fen, level = 2) {
    if (!this.ready) return null;
    const config = STOCKFISH_LEVELS[level] || STOCKFISH_LEVELS[2];
    this.onStatus("AI анализирует позицию");
    this.post("ucinewgame");
    this.post(`setoption name Skill Level value ${config.skill}`);
    this.post(`position fen ${fen}`);
    this.onStatus("Расчёт варианта");

    return new Promise((resolve) => {
      this.pending = { resolve };
      this.post(`go depth ${config.depth} movetime ${config.movetime}`);
    }).finally(() => this.onStatus("Ход найден"));
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
  }
}
