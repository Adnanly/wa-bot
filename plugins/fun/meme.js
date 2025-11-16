module.exports = {
  type: 'command',
  name: 'meme',
  category: 'FUN',
  description: 'Get random meme',
  cooldown: 5,
  async execute(sock, m, args) {
    await m.reply('🎭 Fetching meme...');
    
    try {
      const fetch = require('node-fetch');
      const response = await fetch('https://meme-api.com/gimme');
      const data = await response.json();
      
      await sock.sendMessage(m.from, {
        image: { url: data.url },
        caption: `😂 *${data.title}*\n\n👍 ${data.ups} upvotes\n📱 r/${data.subreddit}`
      }, { quoted: m });
    } catch (error) {
      m.reply('❌ Failed to fetch meme!');
    }
  }
};