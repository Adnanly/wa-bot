const config = require('../../config');

module.exports = {
  type: 'command',
  name: 'sticker',
  aliases: ['s', 'stiker'],
  category: 'STICKER',
  description: 'Create sticker from image/video',
  usage: 'sticker (reply to image/video)',
  async execute(sock, m, args) {
    const quoted = m.quoted;
    if (!quoted) return m.reply('Reply to image or video!');
    
    const mime = quoted.message?.imageMessage?.mimetype || 
                 quoted.message?.videoMessage?.mimetype || '';
    
    if (!/image|video/.test(mime)) {
      return m.reply('Reply to image or video only!');
    }
    
    await m.reply('⏳ Creating sticker...');
    
    try {
      const media = await quoted.download();
      const { Sticker } = require('wa-sticker-formatter');
      
      const sticker = new Sticker(media, {
        pack: config.STICKER_PACK,
        author: config.STICKER_AUTHOR,
        type: 'full',
        quality: 50
      });
      
      const buffer = await sticker.toBuffer();
      await sock.sendMessage(m.from, { sticker: buffer }, { quoted: m });
    } catch (error) {
      console.error(error);
      m.reply('❌ Failed to create sticker!');
    }
  }
};