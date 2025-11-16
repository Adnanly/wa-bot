module.exports = {
  type: 'command',
  name: 'flip',
  aliases: ['coin', 'coinflip'],
  category: 'UTILITY',
  description: 'Flip a coin',
  async execute(sock, m, args) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    m.reply(`🪙 *Coin Flip*\n\nResult: *${result}*`);
  }
};