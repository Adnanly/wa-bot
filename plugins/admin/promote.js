module.exports = {
  type: 'command',
  name: 'promote',
  category: 'ADMIN',
  description: 'Promote user to admin',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  async execute(sock, m, args) {
    const user = m.mentions[0] || m.quoted?.sender;
    if (!user) return m.reply('Tag a user!');
    
    await sock.groupParticipantsUpdate(m.from, [user], 'promote');
    m.reply('✅ User promoted!');
  }
};