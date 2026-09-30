const PLUGIN_ID = 'trimtab@trimtab';
const MARKETPLACE_SOURCE = 'ferhatblnk/trimtab';
const AUTO_EFFORT = 'medium';

function isAutoOn(settings) {
  return settings.enabledPlugins?.[PLUGIN_ID] === true;
}

function currentEfforts(settings) {
  return {
    topLevel: settings.effortLevel ?? null,
    models: Object.fromEntries(
      Object.entries(settings.modelSettings ?? {}).map(([model, options]) => [model, options?.effortLevel ?? null]),
    ),
  };
}

function withEffort(options, level) {
  const next = { ...(options ?? {}) };
  if (level === null) {
    delete next.effortLevel;
  } else {
    next.effortLevel = level;
  }
  return next;
}

function turnOn(settings) {
  const saved = currentEfforts(settings);
  const next = { ...settings, enabledPlugins: { ...settings.enabledPlugins, [PLUGIN_ID]: true } };
  if (saved.topLevel !== null) {
    next.effortLevel = AUTO_EFFORT;
  }
  if (settings.modelSettings) {
    next.modelSettings = Object.fromEntries(
      Object.entries(settings.modelSettings).map(([model, options]) => [model, withEffort(options, AUTO_EFFORT)]),
    );
  }
  return { settings: next, saved };
}

function turnOff(settings, saved) {
  const next = { ...settings, enabledPlugins: { ...settings.enabledPlugins, [PLUGIN_ID]: false } };
  if (!saved) {
    return next;
  }
  if (saved.topLevel === null) {
    delete next.effortLevel;
  } else {
    next.effortLevel = saved.topLevel;
  }
  if (next.modelSettings) {
    next.modelSettings = Object.fromEntries(
      Object.entries(next.modelSettings).map(([model, options]) => [
        model,
        model in saved.models ? withEffort(options, saved.models[model]) : options,
      ]),
    );
  }
  return next;
}

function describeEfforts(saved) {
  if (!saved) {
    return 'unknown';
  }
  const levels = [...new Set([saved.topLevel, ...Object.values(saved.models)].filter(Boolean))];
  return levels.length > 0 ? levels.join(', ') : 'model default';
}

module.exports = { AUTO_EFFORT, MARKETPLACE_SOURCE, PLUGIN_ID, describeEfforts, isAutoOn, turnOff, turnOn };
