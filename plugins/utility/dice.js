module.exports = {
  type: 'command',
  name: 'dice',
  aliases: ['roll'],
  category: 'UTILITY',
  description: 'Roll a dice',
  usage: 'dice [sides]',
  async execute(sock, m, args) {
    const sides = parseInt(args[0]) || 6;
    if (sides < 2 || sides > 100) {
      return m.reply('Sides must be between 2 and 100!');
    }
    
    const result = Math.floor(Math.random() * sides) + 1;
    m.reply(`🎲 *Dice Roll (${sides} sides)*\n\nYou rolled: *${result}*`);
  }
};