const config = require('../../config');

module.exports = {
  type: 'command',
  name: 'warn',
  category: 'ADMIN',
  description: 'Warn a user',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  async execute(sock, m, args) {
    const user = m.mentions[0] || m.quoted?.sender;
    if (!user) return m.reply('Tag a user!');
    
    const key = `${m.from}-${user}`;
    const warnings = global.db.warnings.get(key) || 0;
    const newWarnings = warnings + 1;
    
    global.db.warnings.set(key, newWarnings);
    
    if (newWarnings >= config.MAX_WARNINGS) {
      await sock.groupParticipantsUpdate(m.from, [user], 'remove');
      m.reply(`⚠️ @${user.split('@')[0]} kicked for ${config.MAX_WARNINGS} warnings!`, 
        { mentions: [user] });
    } else {
      m.reply(`⚠️ Warning ${newWarnings}/${config.MAX_WARNINGS} for @${user.split('@')[0]}`, 
        { mentions: [user] });
    }
  }
};