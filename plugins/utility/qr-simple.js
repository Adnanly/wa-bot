module.exports = {
  type: 'command',
  name: 'qr',
  category: 'UTILITY',
  description: 'Generate QR code',
  usage: 'qr <text>',
  async execute(sock, m, args) {
    if (!args.length) return m.reply('Provide text for QR code!');
    
    const text = encodeURIComponent(args.join(' '));
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${text}`;
    
    await sock.sendMessage(m.from, {
      image: { url: qrUrl },
      caption: `📱 *QR Code Generated*\n\nText: ${args.join(' ')}`
    }, { quoted: m });
  }
};