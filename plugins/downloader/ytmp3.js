module.exports = {
  type: 'command',
  name: 'play',
  aliases: ['song', 'music'],
  category: 'DOWNLOADER',
  description: 'Play YouTube music',
  usage: 'play <song name>',
  cooldown: 10,
  limit: 3,
  async execute(sock, m, args) {
    if (!args.length) return m.reply('Provide song name!');
    
    await m.reply('🔍 Searching...');
    
    try {
      const yts = require('yt-search');
      const search = await yts(args.join(' '));
      const video = search.videos[0];
      
      if (!video) return m.reply('❌ Song not found!');
      
      await m.reply(`⏳ Downloading: *${video.title}*`);
      
      const ytdl = require('ytdl-core');
      const stream = ytdl(video.url, { quality: 'highestaudio' });
      
      await sock.sendMessage(m.from, {
        audio: stream,
        mimetype: 'audio/mp4',
        fileName: `${video.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: video.author.name,
            thumbnail: { url: video.thumbnail },
            sourceUrl: video.url,
            mediaType: 2
          }
        }
      }, { quoted: m });
      
    } catch (error) {
      console.error(error);
      m.reply('❌ Download failed! Try another song.');
    }
  }
};