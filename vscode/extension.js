const vscode = require('vscode');
const { execFile } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { AUTO_EFFORT, MARKETPLACE_SOURCE, PLUGIN_ID, describeEfforts, isAutoOn, turnOff, turnOn } = require('./auto-effort');

const CLAUDE_EXTENSION_ID = 'anthropic.claude-code';
const SAVED_EFFORTS_KEY = 'trimtab.savedEfforts';

const claudeDir = () => process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const settingsPath = () => path.join(claudeDir(), 'settings.json');
const installedPluginsPath = () => path.join(claudeDir(), 'plugins', 'installed_plugins.json');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

function writeSettings(settings) {
  const file = settingsPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.trimtab-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(settings, null, 2)}\n`);
  fs.renameSync(temp, file);
}

function isPluginInstalled() {
  return Boolean(readJson(installedPluginsPath()).plugins?.[PLUGIN_ID]);
}

function claudeBinary() {
  const claude = vscode.extensions.getExtension(CLAUDE_EXTENSION_ID);
  if (claude) {
    const bundled = path.join(claude.extensionPath, 'resources', 'native-binary', process.platform === 'win32' ? 'claude.exe' : 'claude');
    if (fs.existsSync(bundled)) {
      return bundled;
    }
  }
  return 'claude';
}

function runClaude(args) {
  return new Promise((resolve, reject) => {
    execFile(claudeBinary(), args, { timeout: 120_000 }, (error, stdout, stderr) =>
      error ? reject(new Error((stderr || stdout || error.message).trim())) : resolve(stdout),
    );
  });
}

async function installPlugin() {
  await runClaude(['plugin', 'marketplace', 'add', MARKETPLACE_SOURCE]);
  await runClaude(['plugin', 'install', PLUGIN_ID]);
}

function activate(context) {
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  status.command = 'trimtab.toggle';
  context.subscriptions.push(status);

  const refresh = () => {
    let settings;
    try {
      settings = readJson(settingsPath());
    } catch {
      status.text = '$(warning) trimtab';
      status.tooltip = `trimtab can't read ${settingsPath()}`;
      status.show();
      return;
    }
    if (!isPluginInstalled()) {
      status.text = '$(cloud-download) trimtab';
      status.tooltip = 'Install trimtab to let Claude Code choose effort per part of a task.';
    } else if (isAutoOn(settings)) {
      status.text = '$(zap) trimtab: Auto';
      status.tooltip = `Auto effort is on. Claude Code sessions run at ${AUTO_EFFORT}, and trimtab raises effort only for the parts that need it. Click to go back to ${describeEfforts(context.globalState.get(SAVED_EFFORTS_KEY))}.`;
    } else {
      status.text = '$(circle-slash) trimtab: Off';
      status.tooltip = 'Auto effort is off. Click to let trimtab choose effort per part of a task.';
    }
    status.show();
  };

  const install = async () => {
    const choice = await vscode.window.showInformationMessage(
      `trimtab installs its Claude Code plugin from github.com/${MARKETPLACE_SOURCE}. It adds agents and two hooks to Claude Code and sends nothing anywhere.`,
      { modal: true },
      'Install',
    );
    if (choice !== 'Install') {
      return false;
    }
    try {
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Installing the trimtab plugin for Claude Code…' },
        installPlugin,
      );
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(`trimtab couldn't install its plugin: ${error.message}`);
      return false;
    } finally {
      refresh();
    }
  };

  const toggle = async () => {
    if (!isPluginInstalled() && !(await install())) {
      return;
    }
    const settings = readJson(settingsPath());
    if (isAutoOn(settings)) {
      writeSettings(turnOff(settings, context.globalState.get(SAVED_EFFORTS_KEY)));
      const restored = describeEfforts(context.globalState.get(SAVED_EFFORTS_KEY));
      await context.globalState.update(SAVED_EFFORTS_KEY, undefined);
      vscode.window.showInformationMessage(`trimtab Auto is off. New Claude Code sessions use your own effort again (${restored}).`);
    } else {
      const { settings: next, saved } = turnOn(settings);
      await context.globalState.update(SAVED_EFFORTS_KEY, saved);
      writeSettings(next);
      vscode.window.showInformationMessage(
        `trimtab Auto is on. New Claude Code sessions start at ${AUTO_EFFORT}, and trimtab raises effort only for the parts that need it.`,
      );
    }
    refresh();
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('trimtab.toggle', toggle),
    vscode.commands.registerCommand('trimtab.install', install),
  );

  fs.watchFile(settingsPath(), { interval: 2000 }, refresh);
  fs.watchFile(installedPluginsPath(), { interval: 2000 }, refresh);
  context.subscriptions.push({
    dispose: () => {
      fs.unwatchFile(settingsPath());
      fs.unwatchFile(installedPluginsPath());
    },
  });

  refresh();
}

function deactivate() {}

module.exports = { activate, deactivate };
