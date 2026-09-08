const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const source = fs.readFileSync('theme/Xboard/assets/distributor.js', 'utf8');
const styles = fs.readFileSync('theme/Xboard/assets/distributor.css', 'utf8');

test('order column controls render expanded by default and preserve in-memory state across list renders', () => {
  const renderer = source.match(/async function renderOrders\(options = \{\}\)[\s\S]*?function periodLabel/);
  assert.ok(renderer, 'the distributor order renderer should exist');
  assert.match(source, /orderFixedColumnsExpanded: true/);
  assert.match(renderer[0], /data-action="expand-order-columns" \$\{state\.orderFixedColumnsExpanded \? 'disabled' : ''\}/);
  assert.match(renderer[0], /data-action="collapse-order-columns" \$\{state\.orderFixedColumnsExpanded \? '' : 'disabled'\}/);
  assert.match(renderer[0], /dist-orders-table \$\{state\.orderFixedColumnsExpanded \? '' : 'is-order-columns-collapsed'\}/);
  assert.doesNotMatch(source, /localStorage[^\n]*orderFixedColumnsExpanded/);
});

test('delegated click path collapses and expands the rendered table without fetching orders', () => {
  const handler = source.match(/async function handleAction\(target\) \{[\s\S]*?async function handleModalAction/);
  assert.ok(handler, 'the delegated action handler should exist');
  assert.match(handler[0], /action === 'expand-order-columns' \|\| action === 'collapse-order-columns'/);
  assert.match(handler[0], /state\.orderFixedColumnsExpanded = action === 'expand-order-columns'/);
  assert.match(handler[0], /classList\.toggle\('is-order-columns-collapsed', !state\.orderFixedColumnsExpanded\)/);
  assert.match(handler[0], /expand-order-columns[\s\S]*toggleAttribute\('disabled', state\.orderFixedColumnsExpanded\)/);
  assert.match(handler[0], /collapse-order-columns[\s\S]*toggleAttribute\('disabled', !state\.orderFixedColumnsExpanded\)/);
});

test('collapsed styling removes both column widths and cells on desktop and mobile without shifting sticky selectors', () => {
  assert.match(styles, /is-order-columns-collapsed \{ min-width:1353px; \}/);
  assert.match(styles, /is-order-columns-collapsed col:nth-child\(-n\+2\)[\s\S]*display:none!important/);
  assert.match(styles, /is-order-columns-collapsed>thead>tr>th:nth-child\(-n\+2\)/);
  assert.match(styles, /is-order-columns-collapsed>tbody>tr:not\(\.dist-entitlement-row\)>td:nth-child\(-n\+2\)/);
  assert.match(styles, /@media \(max-width:900px\)[\s\S]*is-order-columns-collapsed \{ min-width:1353px!important; \}/);
  assert.doesNotMatch(styles, /is-order-columns-collapsed[^}]*nth-child\(3\)[^}]*position:sticky/);
});
