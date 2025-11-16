module.exports = {
  type: 'command',
  name: 'fact',
  category: 'FUN',
  description: 'Get random fact',
  async execute(sock, m, args) {
    const facts = [
      "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible!",
      "Octopuses have three hearts and blue blood.",
      "Bananas are berries, but strawberries aren't!",
      "A group of flamingos is called a 'flamboyance'.",
      "The shortest war in history lasted 38 minutes.",
      "Sharks existed before trees.",
      "Your brain uses 20% of your body's total energy.",
      "The Eiffel Tower can grow up to 6 inches in summer.",
      "Dolphins have names for each other.",
      "A day on Venus is longer than a year on Venus."
    ];
    
    const fact = facts[Math.floor(Math.random() * facts.length)];
    m.reply(`🤓 *Did you know?*\n\n${fact}`);
  }
};