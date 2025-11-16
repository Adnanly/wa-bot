module.exports = {
  type: 'command',
  name: '8ball',
  aliases: ['ask8ball'],
  category: 'FUN',
  description: 'Ask the magic 8 ball',
  usage: '8ball <question>',
  async execute(sock, m, args) {
    if (!args.length) return m.reply('Ask a question!');
    
    const responses = [
      "Yes, definitely!",
      "It is certain.",
      "Without a doubt.",
      "You may rely on it.",
      "As I see it, yes.",
      "Most likely.",
      "Outlook good.",
      "Yes.",
      "Signs point to yes.",
      "Reply hazy, try again.",
      "Ask again later.",
      "Better not tell you now.",
      "Cannot predict now.",
      "Concentrate and ask again.",
      "Don't count on it.",
      "My reply is no.",
      "My sources say no.",
      "Outlook not so good.",
      "Very doubtful."
    ];
    
    const answer = responses[Math.floor(Math.random() * responses.length)];
    m.reply(`🎱 *Magic 8 Ball*\n\n_${args.join(' ')}_\n\n*${answer}*`);
  }
};