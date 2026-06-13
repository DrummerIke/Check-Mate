# BORK Chess PWA

Премиальное шахматное PWA в BORK-стиле: тёмная интеллектуальная игровая комната с крупной доской, Stockfish WebAssembly, режимами AI/PvP, тренером, тактиками, звуком и мобильной компоновкой без лишнего шума.

## Что внутри

- `index.html` — структура PWA, compact launch-сцена, игровой HUD, bottom sheet для ходов/тренера/настроек/статистики, promotion picker и модальное окно результата.
- `style.css` — mobile-first luxury design system: BORK-палитра, крупная премиальная доска, мягкие подсветки, responsive layout, safe-area/standalone режим и bottom sheet на телефонах.
- `app.js` — логика chess.js, режимы AI/PvP/тренировки, Stockfish fallback, подсветки ходов, promotion picker, тренер, голосовые подсказки, статистика, настройки и PWA-регистрация.
- `engine.js` и `stockfish-worker.js` — Web Worker-обёртка Stockfish с уровнями Skill/Depth/Move Time и безопасным fallback, если движок не загрузился.
- `audio.js` — локальный Web Audio API для мягких звуков хода, взятия, шаха, конца партии, ошибки и переключателей без тяжёлых аудиофайлов.
- `manifest.webmanifest`, `service-worker.js`, `icons/icon.svg` — установка на телефон, кеширование основных файлов и BORK-иконка приложения.

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
2. Загрузите в него файлы проекта: `index.html`, `style.css`, `app.js`, `audio.js`, `engine.js`, `stockfish-worker.js`, `service-worker.js`, `manifest.webmanifest`, `icons/icon.svg`, `README.md`.
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
