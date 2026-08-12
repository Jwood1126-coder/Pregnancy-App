/**
 * "This week's to-dos" — week-tagged checkboxes whose state lives in
 * `settings.todosDone`.
 *
 * Toggling one writes to storage and updates that row's DOM in place. The
 * screen is never re-rendered, so the page never jumps under your thumb.
 */

import { el } from '../../lib/dom.js';
import { card } from '../card.js';

/** @typedef {import('../../lib/types.js').Todo} Todo */

/**
 * @typedef {Object} TodosCardOptions
 * @property {Todo[]} todos The week's items (may be empty).
 * @property {Object<string, boolean>} todosDone Persisted done-state by id.
 * @property {(id: string, done: boolean) => void} onToggle Persist one change.
 * @property {boolean} [browsing] True when this is not the current week.
 */

/**
 * Build the to-dos card.
 * @param {TodosCardOptions} options
 * @returns {HTMLElement}
 */
export function todosCard(options) {
  const todos = Array.isArray(options.todos)
    ? options.todos.filter((t) => t && typeof t.id === 'string' && typeof t.label === 'string')
    : [];
  const done = options.todosDone ?? {};

  if (todos.length === 0) {
    return card(
      { title: "This week's to-dos" },
      el(
        'p',
        { class: 'small muted' },
        'Nothing to book this week. Keep up your prenatal vitamin, drink your water, and rest when you can.'
      )
    );
  }

  const rows = todos.map((todo) => {
    const isDone = done[todo.id] === true;

    const box = /** @type {HTMLInputElement} */ (
      el('input', {
        class: 'today-todo__box',
        type: 'checkbox',
        checked: isDone,
        onChange: () => {
          const checked = box.checked;
          row.classList.toggle('today-todo--done', checked);
          options.onToggle(todo.id, checked);
        }
      })
    );

    const row = /** @type {HTMLElement} */ (
      el(
        'label',
        { class: `today-todo${isDone ? ' today-todo--done' : ''}`, 'data-todo': todo.id },
        box,
        el('span', { class: 'today-todo__label' }, todo.label)
      )
    );

    return row;
  });

  return card(
    { title: "This week's to-dos" },
    el('div', { class: 'today-todos' }, rows),
    options.browsing
      ? el('p', { class: 'small muted' }, 'You can tick these off whenever you get to them.')
      : null
  );
}
