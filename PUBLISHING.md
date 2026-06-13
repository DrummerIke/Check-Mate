# Публикация через чистую text-only ветку

Если интерфейс публикации или кнопка `Update branch` сообщает, что бинарные файлы не поддерживаются, не продолжайте обновлять старый PR. Даже когда в текущем дереве больше нет картинок или бинарных payload-файлов, платформа может пытаться применить старую историю ветки или кэш, где такие файлы уже были.

Надёжный обходной путь — создать новую ветку от актуального `main`, перенести в неё только текстовые файлы проекта, сделать один коммит и открыть новый PR из этой чистой ветки.

## 1. Подготовить чистую ветку

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git switch --orphan publish-text-only
```

## 2. Удалить старый индекс и перенести только текстовые файлы

```bash
git rm -rf --cached .
rm -rf ./* ./.??* 2>/dev/null || true
```

Скопируйте из рабочей версии только эти файлы:

```text
.gitattributes
.gitkeep
README.md
PUBLISHING.md
index.html
style.css
app.js
pieces.js
audio.js
engine.js
stockfish-worker.js
service-worker.js
manifest.webmanifest
pieces-preview.html
```

Не переносите `icons/`, изображения, `.wasm`, `.bin` и другие бинарные ассеты до успешного merge/publish.

## 3. Проверить, что ветка text-only

Команда по расширениям изображений и бинарных payload-файлов должна ничего не вывести:

```bash
git ls-files | rg -n '\.(png|jpg|jpeg|webp|gif|ico|svg|wasm|bin)$' || true
```

Проверка NUL-байтов должна показать пустой список:

```bash
python3 - <<'PY'
from pathlib import Path
import subprocess

bad = []
for raw in subprocess.check_output(['git', 'ls-files']).decode().splitlines():
    data = Path(raw).read_bytes()
    if b'\0' in data:
        bad.append(raw)
print('binary-with-nul:', bad)
PY
```

Ожидаемый результат:

```text
binary-with-nul: []
```

## 4. Сделать один коммит и открыть PR

```bash
git add .
git commit -m "Publish text-only app tree"
git push -u origin publish-text-only
```

После этого откройте новый PR из `publish-text-only`. Старый PR с ошибкой бинарных файлов лучше закрыть, чтобы платформа не пыталась переиспользовать проблемную историю.

## 5. Вернуть иконки после публикации

Иконки добавляйте только после успешного merge/publish text-only версии. Если хостинг позволит, можно вручную добавить один из вариантов:

- `icons/icon.svg`
- `icons/favicon.svg`
- PNG-иконки `icons/icon-192.png` и `icons/icon-512.png`

После добавления иконок повторите проверки из раздела 3 и убедитесь, что выбранная платформа уже принимает такие ассеты.
