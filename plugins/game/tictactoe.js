module.exports = {
  type: 'command',
  name: 'tictactoe',
  aliases: ['ttt', 'xo'],
  category: 'GAME',
  description: 'Play Tic Tac Toe',
  isGroup: true,
  async execute(sock, m, args) {
    const opponent = m.mentions[0];
    if (!opponent) return m.reply('Tag opponent to play!');
    if (opponent === m.sender) return m.reply('Cannot play with yourself!');
    
    const gameId = `${m.from}-ttt`;
    
    if (global.games.has(gameId)) {
      return m.reply('Game already in progress!');
    }
    
    global.games.set(gameId, {
      players: [m.sender, opponent],
      board: Array(9).fill(null),
      turn: 0,
      x: m.sender,
      o: opponent
    });
    
    const board = '```\n1 | 2 | 3\n---------\n4 | 5 | 6\n---------\n7 | 8 | 9\n```';
    
    m.reply(
      `🎮 *Tic Tac Toe Started!*\n\n` +
      `X: @${m.sender.split('@')[0]}\n` +
      `O: @${opponent.split('@')[0]}\n\n` +
      `${board}\n\n` +
      `@${m.sender.split('@')[0]}'s turn (X)\n` +
      `Send 1-9 to make move`,
      { mentions: [m.sender, opponent] }
    );
  }
};