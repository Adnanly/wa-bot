module.exports = {
  type: 'command',
  name: 'kick',
  aliases: ['remove'],
  category: 'ADMIN',
  description: 'Kick member from group',
  usage: 'kick @user',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  async execute(sock, m, args) {
    const users = m.mentions.length ? m.mentions : (m.quoted ? [m.quoted.sender] : []);
    
    if (!users.length) {
      return m.reply('Tag or reply to a user!');
    }
    
    for (let user of users) {
      await sock.groupParticipantsUpdate(m.from, [user], 'remove');
    }
    
    m.reply(`✅ Kicked ${users.length} user(s)`);
  }
};