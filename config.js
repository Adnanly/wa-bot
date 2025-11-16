/**
 * LOBBY BOT CONFIGURATION
 * Configure all settings here
 */

require('dotenv').config();

module.exports = {
  // Bot Settings
  BOT_NAME: process.env.BOT_NAME || 'Lobby Bot',
  PREFIX: process.env.PREFIX || '.',
  OWNER_NUMBERS: (process.env.OWNER_NUMBERS || '9942172892').split(','),
  TIMEZONE: 'Asia/Kolkata',
  
  // Lobby Schedule Configuration
  LOBBIES: [
    // 10 AM Lobbies
    {
      time: '0 10 * * *', // 10:00 AM
      name: '12PM 55 LOBBY',
      description: '🎮 12PM Game - 55 Minutes\n\n📅 Time: 12:00 PM\n⏱️ Duration: 55 minutes\n💰 Entry: As per rules\n\n✅ Join now and get ready!'
    },
    {
      time: '0 10 * * *', // 10:00 AM
      name: '12PM 45 LOBBY',
      description: '🎮 12PM Game - 45 Minutes\n\n📅 Time: 12:00 PM\n⏱️ Duration: 45 minutes\n💰 Entry: As per rules\n\n✅ Join now and get ready!'
    },
    
    // 1 PM Lobbies
    {
      time: '0 13 * * *', // 1:00 PM
      name: '3PM 55 LOBBY',
      description: '🎮 3PM Game - 55 Minutes\n\n📅 Time: 3:00 PM\n⏱️ Duration: 55 minutes\n💰 Entry: As per rules\n\n✅ Join now and get ready!'
    },
    {
      time: '0 13 * * *', // 1:00 PM
      name: '3PM 45 LOBBY',
      description: '🎮 3PM Game - 45 Minutes\n\n📅 Time: 3:00 PM\n⏱️ Duration: 45 minutes\n💰 Entry: As per rules\n\n✅ Join now and get ready!'
    },
    
    // 4 PM Lobbies
    {
      time: '0 16 * * *', // 4:00 PM
      name: '6PM 55 LOBBY',
      description: '🎮 6PM Game - 55 Minutes\n\n📅 Time: 6:00 PM\n⏱️ Duration: 55 minutes\n💰 Entry: As per rules\n\n✅ Join now and get ready!'
    },
    {
      time: '0 16 * * *', // 4:00 PM
      name: '6PM 45 LOBBY',
      description: '🎮 6PM Game - 45 Minutes\n\n📅 Time: 6:00 PM\n⏱️ Duration: 45 minutes\n💰 Entry: As per rules\n\n✅ Join now and get ready!'
    },
    
    // 7 PM Lobbies
    {
      time: '0 19 * * *', // 7:00 PM
      name: '9PM 55 LOBBY',
      description: '🎮 9PM Game - 55 Minutes\n\n📅 Time: 9:00 PM\n⏱️ Duration: 55 minutes\n💰 Entry: As per rules\n\n✅ Join now and get ready!'
    },
    {
      time: '0 19 * * *', // 7:00 PM
      name: '9PM 45 LOBBY',
      description: '🎮 9PM Game - 45 Minutes\n\n📅 Time: 9:00 PM\n⏱️ Duration: 45 minutes\n💰 Entry: As per rules\n\n✅ Join now and get ready!'
    },
    
    // 10 PM Lobbies
    {
      time: '0 22 * * *', // 10:00 PM
      name: '12AM 55 LOBBY',
      description: '🎮 12AM Game - 55 Minutes\n\n📅 Time: 12:00 AM\n⏱️ Duration: 55 minutes\n💰 Entry: As per rules\n\n✅ Join now and get ready!'
    },
    {
      time: '0 22 * * *', // 10:00 PM
      name: '12AM 45 LOBBY',
      description: '🎮 12AM Game - 45 Minutes\n\n📅 Time: 12:00 AM\n⏱️ Duration: 45 minutes\n💰 Entry: As per rules\n\n✅ Join now and get ready!'
    }
  ],
  
  // Auto-send rules message after group creation
  LOBBY_RULES: `
╔══════════════════════════╗
║     📋 LOBBY RULES      ║
╚══════════════════════════╝

1️⃣ Be respectful to all players
2️⃣ No cheating or hacking
3️⃣ Follow game timing strictly
4️⃣ Entry fee must be paid before game
5️⃣ No spamming in the group
6️⃣ Admin decisions are final
7️⃣ Have fun and play fair! 🎮

⚠️ Breaking rules = Ban

💬 Need help? Contact admin
  `.trim(),
  
  // Welcome Message Template
  WELCOME_MESSAGE: `
╔══════════════════════════╗
║     👋 WELCOME!         ║
╚══════════════════════════╝

Hey @user! Welcome to @group! 🎉

📋 Please read the rules carefully
🎮 Game starts on time - be ready!
👥 We now have @count members

Good luck! 🍀
  `.trim(),
  
  // Goodbye Message
  GOODBYE_MESSAGE: `
👋 Goodbye @user!

Thanks for playing with us! 😊
  `.trim(),
  
  // Discord Webhook URLs
  DISCORD_WEBHOOKS: {
    // Main logger
    MAIN: process.env.DISCORD_WEBHOOK_MAIN || '',
    
    // Message logger
    MESSAGES: process.env.DISCORD_WEBHOOK_MESSAGES || '',
    
    // Group activity logger
    GROUPS: process.env.DISCORD_WEBHOOK_GROUPS || '',
    
    // Profile picture changes
    PROFILE_PIC: process.env.DISCORD_WEBHOOK_PFP || '',
    
    // Status/Story logger
    STATUS: process.env.DISCORD_WEBHOOK_STATUS || '',
    
    // Command usage logger
    COMMANDS: process.env.DISCORD_WEBHOOK_COMMANDS || '',
    
    // Error logger
    ERRORS: process.env.DISCORD_WEBHOOK_ERRORS || '',
    
    // Join/Leave logger
    JOIN_LEAVE: process.env.DISCORD_WEBHOOK_JOIN_LEAVE || '',
    
    // Deleted messages logger
    DELETED: process.env.DISCORD_WEBHOOK_DELETED || '',
    
    // System logger
    SYSTEM: process.env.DISCORD_WEBHOOK_SYSTEM || ''
  },
  
  // AI Configuration (Groq)
  GROQ_API_KEY: process.env.GROQ_API_KEY || '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',
  GROQ_MODEL: 'llama-3.1-70b-versatile',
  AI_SYSTEM_PROMPT: `You are a helpful assistant for a gaming lobby. Be friendly, concise, and helpful. Keep responses under 200 characters when possible.`,
  // Moderation Settings
  MAX_WARNINGS: 3,
  AUTO_KICK_ON_MAX_WARN: true,
  WARN_EXPIRE_DAYS: 7,
  
  // Anti-spam settings
  MAX_MESSAGES_PER_MINUTE: 10,
  SPAM_BAN_DURATION: 3600000, // 1 hour in ms
  
  // Feature Toggles (Default settings for new groups)
  DEFAULT_GROUP_SETTINGS: {
    welcome: true,
    goodbye: true,
    antiDelete: true,
    antiLink: false,
    antiSpam: true,
    aiEnabled: false,
    autoKickWarned: true,
    logToDiscord: true
  },
  
  // Command Categories with Icons
  COMMAND_CATEGORIES: {
    LOBBY: '🎮',
    AI: '🤖',
    ADMIN: '👑',
    MOD: '⚔️',
    INFO: 'ℹ️',
    FUN: '🎉',
    UTILITY: '🛠️',
    SETTINGS: '⚙️',
    OWNER: '👤'
  },
  
  // Cooldowns (in seconds)
  COOLDOWNS: {
    default: 3,
    ai: 5,
    admin: 1,
    fun: 5,
    search: 10
  },
  
  // Database settings
  DATABASE: {
    type: 'json', // or 'mongodb'
    path: './database/data.json',
    mongodb_url: process.env.MONGODB_URL || ''
  },
  
  // Performance settings
  MAX_MESSAGE_CACHE: 1000,
  CACHE_CLEANUP_INTERVAL: 3600000, // 1 hour
  
  // Embed colors for Discord
  EMBED_COLORS: {
    SUCCESS: 0x00ff00,
    ERROR: 0xff0000,
    WARNING: 0xffff00,
    INFO: 0x00ffff,
    LOBBY: 0xff00ff,
    AI: 0x7289da,
    DEFAULT: 0x2f3136
  }
};