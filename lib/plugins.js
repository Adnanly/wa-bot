// lib/plugins.js
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

async function loadPlugins() {
  const pluginsDir = path.join(__dirname, '..', 'plugins');
  try {
    const categories = await fs.readdir(pluginsDir);
    for (const category of categories) {
      const categoryPath = path.join(pluginsDir, category);
      const stat = await fs.stat(categoryPath);
      if (!stat.isDirectory()) continue;
      const files = await fs.readdir(categoryPath);
      for (const file of files) {
        if (!file.endsWith('.js')) continue;
        try {
          const filePath = path.join(categoryPath, file);
          delete require.cache[require.resolve(filePath)];
          const plugin = require(filePath);
          if (!plugin) continue;
          if (plugin.type === 'command') registerCommand(plugin, category);
          else if (plugin.type === 'event') registerEvent(plugin);
        } catch (error) {
          console.error(chalk.red(`Failed to load ${file}:`), error.message);
        }
      }
    }
  } catch (error) {
    console.error(chalk.red('Failed to load plugins:'), error);
  }
}

function registerCommand(plugin, category) {
  if (!plugin.name) return;
  const command = {
    plugin: plugin,
    name: plugin.name,
    category: (category || 'UNKNOWN').toUpperCase(),
    aliases: plugin.aliases || [],
    cooldown: plugin.cooldown || 3
  };
  if (!global.commands) global.commands = new Map();
  global.commands.set(command.name, command);
  for (const alias of command.aliases) {
    global.commands.set(alias, command);
  }
}

function registerEvent(plugin) {
  if (!plugin.name) return;
  if (!global.events) global.events = new Map();
  global.events.set(plugin.name, plugin);
}

module.exports = { loadPlugins, registerCommand, registerEvent };
