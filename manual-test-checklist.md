# Manual smoke test checklist

Run a local server and verify the real browser interactions. `node --check` is not enough for clickability.

## Mobile width 390×844

- Start screen buttons are clickable: `Свободная игра`, `Тренер`, `Комбинации`.
- Mode buttons are clickable: `Против AI`, `Два игрока`, `Тренировка`.
- Color buttons are clickable: `Белые`, `Чёрные`, `Случайно`.
- `Настройки` opens the menu and `Закрыть` closes it.
- `Начать партию` switches the body to game state and shows the board.
- On mobile, external board coordinates are hidden and the board remains centered.
- On desktop, board coordinates are visible on all four sides.
- Board squares are clickable; selecting a piece shows legal move dots/rings.
- The opponent last move has a visible cool/graphite highlight with a thin warm edge.
- `Совет` opens the compact hint card; `Понятно` closes it.
- `Меню` opens the overlay menu; backdrop click, Escape on desktop, and `Закрыть` close it.
- Menu actions work: `Новая партия`, `Сдаться`, `Развернуть доску`, `Скопировать PGN`, `Комбинации`, `Следующая задача`.
- No horizontal scroll; the board, move strip, and three action buttons fit without overlap.

## Desktop

- Launch card is centered/balanced, with no empty right-side layout.
- Same start/menu/board/hint interactions work with a mouse.
- Menu collapses with `Закрыть` and does not stay pinned open on the side.
- Game board remains the main object; only the top menu button is visible on desktop and the lower menu button is hidden.
