/**
 * Tiny DOM builder. No dependencies, no virtual DOM — just a terse `el()`.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Tags that must be created in the SVG namespace when built with `el()`. */
const SVG_TAGS = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline',
  'polygon', 'text', 'defs', 'use', 'title'
]);

/** Attributes that are best set as DOM properties rather than attributes. */
const PROP_ATTRS = new Set(['value', 'checked', 'disabled', 'selected', 'textContent']);

/**
 * True when `v` looks like an attributes bag rather than a child node.
 * @param {unknown} v
 * @returns {boolean}
 */
function isAttrs(v) {
  return (
    v !== null &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    !(typeof Node !== 'undefined' && v instanceof Node)
  );
}

/**
 * Append one child (Node, string, number, or nested array) to `parent`.
 * `null`, `undefined`, `false`, and `true` are skipped.
 * @param {Element} parent
 * @param {unknown} child
 * @returns {void}
 */
function append(parent, child) {
  if (child === null || child === undefined || child === false || child === true) return;
  if (Array.isArray(child)) {
    for (const c of child) append(parent, c);
    return;
  }
  if (typeof Node !== 'undefined' && child instanceof Node) {
    parent.appendChild(child);
    return;
  }
  parent.appendChild(document.createTextNode(String(child)));
}

/**
 * Create an element.
 *
 * Attribute handling:
 * - `class` / `className` → class attribute
 * - `style` → a CSS string, set verbatim
 * - `value`, `checked`, `disabled`, `selected`, `textContent` → set as properties
 * - `on*` (e.g. `onClick`, `onInput`) → `addEventListener('click' | 'input', fn)`
 * - `aria-*`, `data-*`, and everything else → `setAttribute`
 * - a value of `false`, `null`, or `undefined` skips the attribute entirely;
 *   a value of `true` sets an empty attribute (`hidden: true` → `hidden=""`)
 *
 * Children may be `Node | string | number | null | undefined` or nested arrays
 * (flattened; nullish entries skipped). The second argument may also be a child
 * when it is not a plain attributes object: `el('p', 'hello')`.
 *
 * @param {string} tag Element tag name (SVG tags are namespaced automatically).
 * @param {Object<string, any>} [attrs] Attribute bag (see above).
 * @param {...any} children Child nodes, strings, numbers, or nested arrays.
 * @returns {HTMLElement|SVGElement} The created element.
 */
export function el(tag, attrs = {}, ...children) {
  if (!isAttrs(attrs)) {
    children = [attrs, ...children];
    attrs = {};
  }

  const node = SVG_TAGS.has(tag)
    ? document.createElementNS(SVG_NS, tag)
    : document.createElement(tag);

  for (const [rawKey, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;

    if (rawKey.length > 2 && rawKey.startsWith('on') && typeof value === 'function') {
      node.addEventListener(rawKey.slice(2).toLowerCase(), value);
      continue;
    }

    const key = rawKey === 'className' ? 'class' : rawKey;

    if (PROP_ATTRS.has(key)) {
      // @ts-ignore — indexed property assignment on a DOM node
      node[key] = value;
      continue;
    }

    node.setAttribute(key, value === true ? '' : String(value));
  }

  for (const child of children) append(node, child);

  // @ts-ignore — the union is narrowed by the caller
  return node;
}

/**
 * Remove every child of a node.
 * @param {Element} node
 * @returns {Element} The same node, now empty.
 */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/**
 * Replace a node's children with new content.
 * @param {Element} node
 * @param {...any} children Same forms accepted by {@link el}.
 * @returns {Element} The same node.
 */
export function mount(node, ...children) {
  clear(node);
  for (const child of children) append(node, child);
  return node;
}
