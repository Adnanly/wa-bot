// plugins/events/game-handler.js
module.exports = {
  name: 'tictactoe-handler',
  condition: (m) => {
    try {
      if (!m) return false;

      // Try known global containers (adjust if you use different names)
      const activeGames = global.activeGames || global.games || global.gameSessions;

      // Ensure it exists and has .has
      if (!activeGames || typeof activeGames.has !== 'function') return false;

      // Determine the key you store games under. Common choices: m.from, m.key.remoteJid, m.sender
      const key = m.from || m.key?.remoteJid || m.sender;
      if (!key) return false;

      return activeGames.has(key);
    } catch (err) {
      console.error('tictactoe condition error:', err);
      return false;
    }
  },

  execute: async (sock, m) => {
    // existing tictactoe logic
  }
};
