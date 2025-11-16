module.exports = {
  type: 'command',
  name: 'quote',
  category: 'FUN',
  description: 'Get inspirational quote',
  async execute(sock, m, args) {
    const quotes = [
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Innovation distinguishes between a leader and a follower. - Steve Jobs",
      "Life is what happens when you're busy making other plans. - John Lennon",
      "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
      "It is during our darkest moments that we must focus to see the light. - Aristotle",
      "The only impossible journey is the one you never begin. - Tony Robbins",
      "Success is not final, failure is not fatal. - Winston Churchill",
      "Believe you can and you're halfway there. - Theodore Roosevelt",
      "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
      "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb"
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    m.reply(`💭 *Quote of the day:*\n\n_${randomQuote}_`);
  }
};