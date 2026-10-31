import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import {
  ShadowEditor,
  createShadow,
  createShadowLayer,
  shadowToCss,
  validateShadow,
} from '../dist/esm/index.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  IS_REACT_ACT_ENVIRONMENT: true,
});
const { createRoot } = await import('react-dom/client');
after(() => dom.window.close());

test('empty, fresh defaults, ordered layers, alpha and inset CSS', () => {
  assert.equal(shadowToCss({ layers: [] }), 'none');
  const value = createShadow();
  value.layers.push({
    ...createShadowLayer('b'),
    inset: true,
    color: '#ff8800',
    x: -3,
    spread: -2,
    opacity: 0.5,
  });
  assert.match(
    shadowToCss(value),
    /rgba\(0, 0, 0, 0.2\), inset -3px 4px 12px -2px rgba\(255, 136, 0, 0.5\)/,
  );
  assert.deepEqual(validateShadow(value), []);
  value.layers[0].blur = 50;
  assert.equal(createShadow().layers[0].blur, 12);
});

test('bounds, unsafe colors, duplicate ids and finite values fail', () => {
  for (const patch of [
    { blur: -1 },
    { blur: 1001 },
    { x: Infinity },
    { spread: -1001 },
    { opacity: 1.1 },
    { opacity: NaN },
    { color: 'red); color:red' },
    { inset: 'yes' },
  ]) {
    const value = createShadow();
    Object.assign(value.layers[0], patch);
    assert.throws(() => shadowToCss(value), RangeError);
  }
  assert.throws(() => createShadowLayer(''), RangeError);
  const value = createShadow();
  value.layers.push({ ...value.layers[0] });
  assert.ok(validateShadow(value).length);
  assert.throws(
    () =>
      shadowToCss({ layers: Array.from({ length: 17 }, (_, i) => createShadowLayer(String(i))) }),
    RangeError,
  );
});

test('controlled numeric edits, inset, add/remove/reorder, disabled and unmount', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  let value = createShadow();
  const render = (disabled = false) =>
    root.render(
      React.createElement(ShadowEditor, {
        value,
        disabled,
        onChange: (next) => {
          value = next;
          render();
        },
      }),
    );
  await act(() => render());
  const input = [...host.querySelectorAll('label')]
    .find((node) => node.textContent === 'Shadow 1 blur')
    .querySelector('input');
  await act(() => {
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(
      input,
      '24',
    );
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  });
  assert.equal(value.layers[0].blur, 24);
  await act(() => host.querySelector('input[type="checkbox"]').click());
  assert.equal(value.layers[0].inset, true);
  const button = (text) =>
    [...host.querySelectorAll('button')].find((node) => node.textContent === text);
  await act(() => button('Add shadow').click());
  const secondId = value.layers[1].id;
  await act(() => button('Move shadow 2 forward').click());
  assert.equal(value.layers[0].id, secondId);
  await act(() => button('Remove shadow 1').click());
  assert.equal(value.layers.length, 1);
  await act(() => render(true));
  assert.equal(button('Add shadow').disabled, true);
  await act(() => root.unmount());
  host.remove();
});
