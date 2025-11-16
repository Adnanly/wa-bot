module.exports = {
  type: 'command',
  name: 'ping',
  aliases: ['speed', 'test'],
  category: 'INFO',
  description: 'Check bot response speed',
  async execute(sock, m, args) {
    const start = Date.now();
    const sent = await m.reply('🏓 Pinging...');
    const end = Date.now();
    
    await sock.sendMessage(m.from, {
      text: `🏓 Pong!\n⚡ Speed: ${end - start}ms`,
      edit: sent.key
    });
  }
};