# Reviews Panel Not Rendering After Button Text Change

## Problem
Панель «Избранные цитаты» открывалась, но табы и цитаты не рендерились — пустая панель.

## Root Cause
При изменении текста кнопки «Все упоминания и отзывы» → «Избранные цитаты из 722 упоминаний» был удалён `<span class="rev-count-total">` из HTML, но в JS-функции `initReviews()` осталась строка:
```js
document.querySelector('.rev-count-total').textContent = `(${total} цитат)`;
```
→ `querySelector` возвращал `null` → `TypeError: Cannot set properties of null` → весь `initReviews()` крашился, табы и список не создавались.

## Solution
Удалена строка с `querySelector('.rev-count-total')` из `initReviews()`.

## Prevention
- **При удалении DOM-элемента** — всегда grep'ить все JS-ссылки (classname, id)
- Использовать optional chaining: `el?.textContent = ...`
- При существенных изменениях — проверять DevTools Console на ошибки
