const SOURCES = [
  "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.wasm.js",
  "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js",
];

let loaded = false;
for (const source of SOURCES) {
  try {
    importScripts(source);
    loaded = true;
    postMessage("status:Движок Stockfish готовится");
    break;
  } catch (error) {
    // Try next source.
  }
}

if (!loaded) {
  postMessage("error:Не удалось загрузить Stockfish");
}
