# BORK Chess PWA

Премиальное шахматное PWA в BORK-стиле: тёмная интеллектуальная игровая комната с крупной доской, Stockfish WebAssembly, режимами AI/PvP, тренером, тактиками, звуком и мобильной компоновкой без лишнего шума.

## Что внутри

- `index.html` — структура PWA, compact launch-сцена, игровой HUD, bottom sheet для ходов/тренера/настроек/статистики, promotion picker и модальное окно результата.
- `style.css` — mobile-first luxury design system: BORK-палитра, крупная премиальная доска, мягкие подсветки, responsive layout, safe-area/standalone режим и bottom sheet на телефонах.
- `app.js` — логика chess.js, режимы AI/PvP/тренировки, Stockfish fallback, подсветки ходов, promotion picker, тренер, голосовые подсказки, статистика, настройки и PWA-регистрация.
- `pieces.js` — оригинальный inline SVG-набор BORK-фигур: матовые ivory-белые и smoked steel-чёрные силуэты без внешних иконок, emoji или Unicode-шахмат.
- `engine.js` и `stockfish-worker.js` — Web Worker-обёртка Stockfish с уровнями Skill/Depth/Move Time и безопасным fallback, если движок не загрузился.
- `audio.js` — локальный Web Audio API для мягких звуков хода, взятия, шаха, конца партии, ошибки и переключателей без тяжёлых аудиофайлов.
- `manifest.webmanifest`, `service-worker.js` и `icons/*.svg` — установка на телефон, SVG-favicon/maskable-иконка и кеширование текстовых PWA-ассетов без PNG/JPG/ICO.
- `pieces-preview.html` — локальная витрина фигур на тёмном/светлом фоне, шахматных клетках и размерах 32/48/64/96 px.

## Как запустить локально

Откройте `index.html` в браузере или запустите локальный сервер, чтобы модульные импорты и service worker работали так же, как на GitHub Pages:

```bash
python -m http.server 8000
```

После этого откройте:

```text
http://localhost:8000
```

## Как развернуть на GitHub Pages

1. Создайте новый репозиторий, например `bork-chess`.
2. Загрузите в него только текстовые файлы проекта: `index.html`, `style.css`, `app.js`, `pieces.js`, `audio.js`, `engine.js`, `stockfish-worker.js`, `service-worker.js`, `manifest.webmanifest`, `pieces-preview.html`, `icons/favicon.svg`, `icons/icon.svg`, `icons/maskable.svg`, `.gitattributes`, `PUBLISHING.md`, `README.md`.
3. Откройте репозиторий на GitHub.
4. Перейдите в `Settings` → `Pages`.
5. В разделе `Build and deployment` выберите:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Сохраните.
7. Через некоторое время сайт будет доступен по адресу вида:

```text
https://ВАШ_ЛОГИН.github.io/bork-chess/
```



> Если интерфейс публикации или обновления ветки пишет, что бинарные файлы не поддерживаются, не нажимайте повторно `Update branch` в старом PR. Используйте инструкцию [PUBLISHING.md](./PUBLISHING.md): создайте чистую text-only ветку от актуального `main`, перенесите только текстовые файлы и откройте новый PR. SVG-иконки остаются текстовыми ассетами и входят в clean-ветку; PNG/JPG/ICO не добавляйте.

## Мобильный UX

На телефоне интерфейс пересобран как приложение: компактная topbar-строка, статус партии, крупная доска, три действия `Отмена` / `Совет` / `Меню` и fullscreen-меню для настроек, статистики, PGN/FEN, обучения и действий партии. Голос тренера выключен по умолчанию и работает только по ручному нажатию `Озвучить`; режим `Комбинации` запускает встроенные тактические позиции без backend.

## Как вставить в Google Sites

В Google Sites:

1. Откройте нужную страницу.
2. Нажмите `Вставка`.
3. Выберите `Встроить`.
4. Перейдите на вкладку `Встроить код`.
5. Вставьте код:

```html
<iframe
  src="https://ВАШ_ЛОГИН.github.io/bork-chess/"
  style="width:100%; height:820px; border:0; border-radius:24px; overflow:hidden;"
  loading="lazy"
  allowfullscreen>
</iframe>
```

Для компактных мобильных блоков можно уменьшить высоту до `760px`; layout использует `100dvh`, safe-area и bottom sheet, поэтому не требует горизонтального скролла.

## Важно

AI использует Stockfish WebAssembly через Web Worker и не блокирует интерфейс; если CDN движка недоступен, приложение показывает fallback-статус и продолжает игру локальной оценкой. Звук работает через Web Audio API после первого пользовательского действия и сохраняется в настройках. Голос тренера использует локальный Web Speech API: он выключен по умолчанию, не отправляет данные наружу и мягко деградирует, если браузер не поддерживает `speechSynthesis`.
