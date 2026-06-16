const PIECE_LABELS = {
  p: "Пешка",
  n: "Конь",
  b: "Слон",
  r: "Ладья",
  q: "Ферзь",
  k: "Король",
};

const PIECE_SHAPES = {
  p: `
    <ellipse class="piece-core piece-head" cx="50" cy="28" rx="13" ry="12"/>
    <path class="piece-core" d="M38 45c0-7 5-11 12-11s12 4 12 11v7c0 5 2 9 5 13l4 6H29l4-6c3-4 5-8 5-13z"/>
    <path class="piece-core" d="M25 78c3-8 10-13 25-13s22 5 25 13v7H25z"/>
    <path class="piece-edge" d="M34 77h32"/>
    <path class="piece-highlight" d="M43 23c4-4 10-5 15-2"/>
  `,
  n: `
    <path class="piece-core" d="M28 85v-7c2-7 8-12 17-14l3-10c-8-5-10-13-5-23 4-8 12-15 24-19 7 6 10 14 9 24l8 7-11 11H61c-4 8-6 16-6 24h21v7z"/>
    <path class="piece-shadow" d="M47 64c8-5 14-10 18-18"/>
    <path class="piece-accent" d="M61 21c6 5 8 10 7 17"/>
    <path class="piece-cut" d="M54 35l13 4"/>
    <circle class="piece-eye" cx="63" cy="31" r="2.4"/>
    <path class="piece-edge" d="M32 78h42"/>
  `,
  b: `
    <path class="piece-core" d="M31 85v-7c2-8 9-13 19-13s17 5 19 13v7z"/>
    <path class="piece-core" d="M35 64c1-17 7-31 15-47 8 16 14 30 15 47-4 5-9 8-15 8s-11-3-15-8z"/>
    <path class="piece-accent" d="M58 28L43 55"/>
    <path class="piece-highlight" d="M44 28c-3 8-5 17-5 27"/>
    <path class="piece-edge" d="M34 78h32"/>
  `,
  r: `
    <path class="piece-core" d="M28 85v-8c3-7 9-10 22-10s19 3 22 10v8z"/>
    <path class="piece-core" d="M35 67V36h30v31z"/>
    <path class="piece-core" d="M29 33V21h10v6h7v-6h8v6h7v-6h10v12l-5 7H34z"/>
    <path class="piece-accent" d="M38 43h24"/>
    <path class="piece-highlight" d="M42 39v21"/>
    <path class="piece-edge" d="M33 77h34"/>
  `,
  q: `
    <path class="piece-core" d="M25 85v-8c3-8 11-12 25-12s22 4 25 12v8z"/>
    <path class="piece-core" d="M32 64l-5-35 14 15 9-25 9 25 14-15-5 35c-5 5-11 8-18 8s-13-3-18-8z"/>
    <circle class="piece-core piece-jewel" cx="27" cy="27" r="5"/>
    <circle class="piece-core piece-jewel" cx="50" cy="17" r="5.5"/>
    <circle class="piece-core piece-jewel" cx="73" cy="27" r="5"/>
    <path class="piece-accent" d="M37 58h26"/>
    <path class="piece-highlight" d="M45 28l5-11 5 11"/>
    <path class="piece-edge" d="M33 77h34"/>
  `,
  k: `
    <path class="piece-core" d="M26 85v-8c3-8 11-12 24-12s21 4 24 12v8z"/>
    <path class="piece-core" d="M34 64l-5-32 14 9 7-22 7 22 14-9-5 32c-4 5-10 8-16 8s-12-3-16-8z"/>
    <path class="piece-accent" d="M50 14v24"/>
    <path class="piece-accent" d="M42 26h16"/>
    <path class="piece-highlight" d="M42 43c3 6 5 11 5 19"/>
    <path class="piece-edge" d="M33 77h34"/>
  `,
};

export function renderPiece(piece) {
  if (!piece || !PIECE_SHAPES[piece.type]) return "";
  const colorClass = piece.color === "w" ? "piece-white" : "piece-black";
  const label = `${piece.color === "w" ? "Белые" : "Чёрные"}: ${PIECE_LABELS[piece.type]}`;

  return `<svg class="piece-svg ${colorClass} piece-${piece.type}" viewBox="0 0 100 100" role="img" aria-label="${label}" focusable="false">
    <g class="piece-mark" vector-effect="non-scaling-stroke">
      ${PIECE_SHAPES[piece.type]}
    </g>
  </svg>`;
}
