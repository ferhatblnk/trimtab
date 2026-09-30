const { test } = require('node:test');
const assert = require('node:assert/strict');
const { describeEfforts, isAutoOn, turnOff, turnOn } = require('./auto-effort');

const original = {
  model: 'opus',
  effortLevel: 'xhigh',
  modelSettings: { 'claude-opus-5-5': { effortLevel: 'max', other: 1 }, 'claude-sonnet-5-5': {} },
  enabledPlugins: { 'shopify-plugin@shopify-ai-toolkit': true },
  permissions: { allow: ['Bash(ls)'] },
};

test('turning Auto on sets medium everywhere and enables the plugin', () => {
  const { settings, saved } = turnOn(original);
  assert.equal(settings.effortLevel, 'medium');
  assert.deepEqual(settings.modelSettings, {
    'claude-opus-5-5': { effortLevel: 'medium', other: 1 },
    'claude-sonnet-5-5': { effortLevel: 'medium' },
  });
  assert.equal(settings.enabledPlugins['trimtab@trimtab'], true);
  assert.equal(settings.enabledPlugins['shopify-plugin@shopify-ai-toolkit'], true);
  assert.deepEqual(settings.permissions, original.permissions);
  assert.equal(isAutoOn(settings), true);
  assert.equal(describeEfforts(saved), 'xhigh, max');
});

test('turning Auto off restores exactly what was there', () => {
  const { settings, saved } = turnOn(original);
  const restored = turnOff(JSON.parse(JSON.stringify(settings)), JSON.parse(JSON.stringify(saved)));
  assert.deepEqual(restored, { ...original, enabledPlugins: { ...original.enabledPlugins, 'trimtab@trimtab': false } });
  assert.equal(isAutoOn(restored), false);
});

test('a settings file without effort stays without effort', () => {
  const { settings, saved } = turnOn({});
  assert.equal(settings.effortLevel, undefined);
  assert.deepEqual(turnOff(settings, saved), { enabledPlugins: { 'trimtab@trimtab': false } });
  assert.equal(describeEfforts(saved), 'model default');
});

test('models added while Auto was on keep their own level', () => {
  const { settings, saved } = turnOn(original);
  settings.modelSettings['claude-fable-5-1'] = { effortLevel: 'high' };
  assert.deepEqual(turnOff(settings, saved).modelSettings['claude-fable-5-1'], { effortLevel: 'high' });
});
