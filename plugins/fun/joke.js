module.exports = {
  type: 'command',
  name: 'joke',
  category: 'FUN',
  description: 'Get random joke',
  async execute(sock, m, args) {
    try {
      const fetch = require('node-fetch');
      const response = await fetch('https://official-joke-api.appspot.com/random_joke');
      const joke = await response.json();
      m.reply(`😂 *${joke.setup}*\n\n${joke.punchline}`);
    } catch (error) {
      m.reply('❌ Failed to fetch joke!');
    }
  }
};