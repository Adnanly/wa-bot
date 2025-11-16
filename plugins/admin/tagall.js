module.exports = {
  type: 'command',
  name: 'tagall',
  aliases: ['everyone', 'all'],
  category: 'ADMIN',
  description: 'Tag all members',
  isGroup: true,
  isAdmin: true,
  async execute(sock, m, args) {
    const groupMetadata = await sock.groupMetadata(m.from);
    const participants = groupMetadata.participants;
    
    let text = args.join(' ') || 'Attention everyone!';
    text += '\n\n';
    
    const mentions = participants.map(p => p.id);
    
    for (let member of participants) {
      text += `@${member.id.split('@')[0]}\n`;
    }
    
    await sock.sendMessage(m.from, { text, mentions });
  }
};