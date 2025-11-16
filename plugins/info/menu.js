const config = require('../../config');

module.exports = {
  type: 'command',
  name: 'menu',
  aliases: ['help', 'commands'],
  category: 'INFO',
  description: 'Show all commands',
  async execute(sock, m, args) {
    const categories = {};
    
    for (const [name, cmd] of global.commands) {
      if (cmd.name !== name) continue;
      if (!categories[cmd.category]) categories[cmd.category] = [];
      categories[cmd.category].push(cmd);
    }
    
    let text = `╭━━『 *${config.BOT_NAME}* 』━━╮\n`;
    text += `│ 👤 User: ${m.pushName}\n`;
    text += `│ 🤖 Commands: ${global.commands.size}\n`;
    text += `│ 📅 Date: ${new Date().toLocaleDateString()}\n`;
    text += `╰━━━━━━━━━━━━━━╯\n\n`;
    
    for (const [category, cmds] of Object.entries(categories)) {
      text += `┏━━『 ${category} 』\n`;
      for (const cmd of cmds) {
        text += `┃ • ${config.PREFIX}${cmd.name}\n`;
      }
      text += `┗━━━━━━━━━━━━\n\n`;
    }
    
    text += `_Type ${config.PREFIX}help <command> for details_`;
    
    m.reply(text);
  }
};