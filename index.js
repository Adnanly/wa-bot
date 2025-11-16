/**
 * 🎮 PROFESSIONAL LOBBY MANAGEMENT BOT
 * Auto-create lobbies, Discord logging, AI assistant, 100+ commands
 * Advanced features: AFK, Anti-delete, Welcome, Moderation
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  jidDecode
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const chalk = require('chalk');
const figlet = require('figlet');
const moment = require('moment-timezone');
const cron = require('node-cron');
const fs = require('fs');
const axios = require('axios');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');

const config = require('./config');
const { loadPlugins } = require('./lib/plugins');
const { serialize } = require('./lib/serialize');
const { DiscordLogger } = require('./lib/discord-logger');
const { LobbyManager } = require('./lib/lobby-manager');
const { AIManager } = require('./lib/ai-manager');

// Robust DatabaseManager loader (works with module.exports or export default)
let DatabaseManager = require('./core/DatabaseManager');
DatabaseManager = DatabaseManager && DatabaseManager.default ? DatabaseManager.default : DatabaseManager;

// Global storage
global.commands = new Map();
global.events = new Map();
global.cooldowns = new Map();
global.afkUsers = new Map();
global.deletedMessages = new Map();
global.aiSessions = new Map();
global.groupSettings = new Map();
global.userWarnings = new Map();
global.bannedUsers = new Set();

// Initialize managers
let discordLogger;
let lobbyManager;
let aiManager;
let database;

/**
 * Display banner
 */
function displayBanner() {
  console.clear();
  console.log(chalk.cyan(figlet.textSync('LOBBY BOT', {
    font: 'ANSI Shadow',
    horizontalLayout: 'full'
  })));
  console.log(chalk.yellow('═'.repeat(70)));
  console.log(chalk.green('🎮 Professional Lobby Management System'));
  console.log(chalk.green('🤖 AI Assistant | 📊 Discord Logging | ⚡ 100+ Commands'));
  console.log(chalk.yellow('═'.repeat(70)));
  console.log('');
}

/**
 * Start the bot
 */
async function startBot() {
  displayBanner();
  
  console.log(chalk.cyan('📦 Initializing systems...'));
  
  // Initialize Discord logger
  discordLogger = new DiscordLogger(config.DISCORD_WEBHOOKS);
  await discordLogger.init();
  console.log(chalk.green('✓ Discord logger initialized'));
  
  // Initialize database
  database = new DatabaseManager();
  await database.init();
  console.log(chalk.green('✓ Database connected'));
  
  // Initialize AI manager
  aiManager = new AIManager(config.GROQ_API_KEY);
  console.log(chalk.green('✓ AI manager initialized'));
  
  // Load plugins
  await loadPlugins();
  console.log(chalk.green(`✓ Loaded ${commands.size} commands`));
  console.log(chalk.green(`✓ Loaded ${events.size} events`));
  
  // Setup auth
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();
  
  console.log(chalk.blue(`📱 Using WhatsApp v${version.join('.')}`));
  console.log('');
  
  // Create socket (do NOT use printQRInTerminal - handle QR in connection.update)
  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: ['Lobby Bot', 'Chrome', '4.0.0'],
    getMessage: async (key) => {
      if (global.deletedMessages.has(key.id)) {
        return global.deletedMessages.get(key.id);
      }
      return { conversation: '' };
    }
  });

  // Initialize lobby manager
  lobbyManager = new LobbyManager(sock, discordLogger);
  await lobbyManager.startScheduler();
  console.log(chalk.green('✓ Lobby scheduler started'));
  
  // Connection handler
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log(chalk.yellow('📱 Scan QR code to connect'));
      try { qrcodeTerminal.generate(qr, { small: true }); } catch (e) {}
      try { await QRCode.toFile('./whatsapp-qr.png', qr); console.log(chalk.green('📸 QR saved to ./whatsapp-qr.png')); } catch(e){}
    } else {
      // no qr: likely valid session exists
    }
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;
      
      if (shouldReconnect) {
        console.log(chalk.red('⚠️  Connection closed, reconnecting...'));
        setTimeout(() => startBot(), 3000);
      }
    } else if (connection === 'open') {
      console.log(chalk.green('═'.repeat(70)));
      console.log(chalk.green('✅ BOT CONNECTED SUCCESSFULLY!'));
      console.log(chalk.green('═'.repeat(70)));
      console.log(chalk.cyan('🎮 Lobby System: ACTIVE'));
      console.log(chalk.cyan('📊 Discord Logging: ACTIVE'));
      console.log(chalk.cyan('🤖 AI Assistant: READY'));
      console.log(chalk.green('═'.repeat(70)));
      console.log('');
      
      // Log to Discord
      await discordLogger.logSystem({
        title: '🟢 Bot Online',
        description: 'Lobby bot is now online and ready!',
        color: 0x00ff00,
        timestamp: new Date()
      });
    }
  });
  
  // Save creds
  sock.ev.on('creds.update', saveCreds);
  
  // Message handler
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (let msg of messages) {
      if (!msg.message) continue;
      
      try {
        // Store message for anti-delete
        if (msg.key.id) {
          global.deletedMessages.set(msg.key.id, msg.message);
        }
        
        // Serialize message
        const m = await serialize(sock, msg);
        
        // Log message to Discord
        await discordLogger.logMessage(m);
        
        // Handle AFK
        await handleAFK(sock, m);
        
        // Handle AI
        await handleAI(sock, m);
        
        // Handle commands
        await handleCommand(sock, m);
        
        // Handle events
        await handleEvents(sock, m);
        
      } catch (error) {
        console.error(chalk.red('Message handler error:'), error);
      }
    }
  });
  
  // Message delete handler (Anti-delete)
  sock.ev.on('messages.update', async (updates) => {
    for (let update of updates) {
      if (update.update && update.update.messageStubType === 1) { // Deleted message
        const deletedMsg = global.deletedMessages.get(update.key.id);
        if (deletedMsg) {
          await handleAntiDelete(sock, update, deletedMsg);
        }
      }
    }
  });
  
  // Group participants update
  sock.ev.on('group-participants.update', async (update) => {
    await handleGroupUpdate(sock, update);
  });
  
  // Profile picture update
  sock.ev.on('contacts.update', async (updates) => {
    for (let update of updates) {
      if (update.imgUrl) {
        await discordLogger.logProfilePicture({
          jid: update.id,
          name: update.name || update.id.split('@')[0],
          url: update.imgUrl
        });
      }
    }
  });
  
  // Status update handler (status broadcasts)
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (let msg of messages) {
      if (msg.key.remoteJid === 'status@broadcast') {
        await discordLogger.logStatus(msg);
      }
    }
  });
  
  return sock;
}

/**
 * Handle commands
 *
 * This version normalizes command objects that might be stored as:
 * - cmd (normal)
 * - { plugin: { ... } }
 * - { default: { ... } } (transpiled ESM)
 */
async function handleCommand(sock, m) {
  if (!m.body || m.key.fromMe) return;
  
  const prefix = config.PREFIX;
  if (!m.body.startsWith(prefix)) return;
  
  const args = m.body.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();
  const rawCmd = commands.get(cmdName);
  
  if (!rawCmd) return;
  
  // Normalize the command object to support multiple plugin shapes
  // Prefer: rawCmd.execute -> rawCmd.plugin.execute -> rawCmd.default.execute
  const cmd = (rawCmd && typeof rawCmd.execute === 'function')
    ? rawCmd
    : (rawCmd && rawCmd.plugin && typeof rawCmd.plugin.execute === 'function')
      ? rawCmd.plugin
      : (rawCmd && rawCmd.default && typeof rawCmd.default.execute === 'function')
        ? rawCmd.default
        : null;
  
  if (!cmd) {
    console.error(chalk.red(`Command "${cmdName}" is invalid: missing execute()`), rawCmd);
    return m.reply('❌ Command is not available (internal error).');
  }
  
  // Determine metadata
  const cmdMetaName = cmd.name || cmd.command || cmdName;
  const cooldownAmount = (cmd.cooldown || 3) * 1000;
  
  // Check if banned
  if (global.bannedUsers.has(m.sender)) {
    return m.reply('❌ You are banned from using this bot!');
  }
  
  // Check cooldown
  const cooldownKey = `${m.sender}-${cmdMetaName}`;
  if (global.cooldowns.has(cooldownKey)) {
    const expirationTime = global.cooldowns.get(cooldownKey);
    if (Date.now() < expirationTime) {
      const timeLeft = ((expirationTime - Date.now()) / 1000).toFixed(1);
      return m.reply(`⏰ Cooldown! Wait ${timeLeft}s`);
    }
  }
  
  // Set cooldown
  global.cooldowns.set(cooldownKey, Date.now() + cooldownAmount);
  setTimeout(() => global.cooldowns.delete(cooldownKey), cooldownAmount);
  
  // Permission checks
  if (cmd.ownerOnly && !config.OWNER_NUMBERS.includes(m.sender.split('@')[0])) {
    return m.reply('👑 Owner only command!');
  }
  
  if (cmd.groupOnly && !m.isGroup) {
    return m.reply('👥 This command is for groups only!');
  }
  
  if (cmd.adminOnly && !m.isAdmin) {
    return m.reply('⚠️ Admin only!');
  }
  
  if (cmd.botAdminRequired && !m.isBotAdmin) {
    return m.reply('🤖 Bot needs admin rights!');
  }
  
  try {
    console.log(chalk.cyan(`[CMD] ${m.pushName} → ${prefix}${cmdMetaName}`));
    
    // Execute command (support both sync and async)
    const maybePromise = cmd.execute(sock, m, args);
    if (maybePromise && typeof maybePromise.then === 'function') {
      await maybePromise;
    }
    
    // Log to Discord
    await discordLogger.logCommand({
      user: m.pushName,
      userId: m.sender,
      command: cmdMetaName,
      args: args.join(' '),
      group: m.isGroup ? m.groupName : 'Private',
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error(chalk.red('Command error:'), error);
    m.reply('❌ An error occurred!');
    
    // Log error to Discord
    await discordLogger.logError({
      command: cmdMetaName,
      error: error.message,
      user: m.pushName,
      timestamp: new Date()
    });
  }
}

/**
 * Handle events
 */
async function handleEvents(sock, m) {
  for (const [name, event] of global.events) {
    try {
      // Only evaluate condition if it's a function. If condition exists and returns false, skip.
      let shouldRun = true;
      if (typeof event.condition === 'function') {
        try {
          shouldRun = event.condition(m);
        } catch (condErr) {
          // defensive: log condition error and skip event
          console.error(`Event ${name} condition error:`, condErr);
          shouldRun = false;
        }
      }
      if (!shouldRun) continue;

      // Ensure execute exists
      if (typeof event.execute !== 'function') {
        console.error(`Event ${name} has no execute() function — skipping.`, event);
        continue;
      }

      await event.execute(sock, m);
    } catch (error) {
      console.error(chalk.red(`Event ${name} error:`), error);
    }
  }
}

/**
 * Handle AFK system
 */
async function handleAFK(sock, m) {
  // Check if sender is AFK and remove
  if (global.afkUsers.has(m.sender)) {
    const afkData = global.afkUsers.get(m.sender);
    global.afkUsers.delete(m.sender);
    
    const duration = moment.duration(Date.now() - afkData.time);
    const timeString = duration.humanize();
    
    await m.reply(`✅ Welcome back ${m.pushName}! You were AFK for ${timeString}\nReason: ${afkData.reason}`);
  }
  
  // Check if mentioned users are AFK
  if (m.mentions && m.mentions.length > 0) {
    for (const mention of m.mentions) {
      if (global.afkUsers.has(mention)) {
        const afkData = global.afkUsers.get(mention);
        const duration = moment.duration(Date.now() - afkData.time);
        const timeString = duration.humanize();
        
        await m.reply(`💤 @${mention.split('@')[0]} is AFK\nReason: ${afkData.reason}\nSince: ${timeString} ago`, {
          mentions: [mention]
        });
      }
    }
  }
}

/**
 * Handle AI assistant
 */
async function handleAI(sock, m) {
  if (m.key.fromMe) return;
  
  const groupSettings = global.groupSettings.get(m.from) || {};
  
  // Check if AI is enabled for this chat
  if (groupSettings.aiEnabled) {
    // Don't respond to commands
    if (m.body.startsWith(config.PREFIX)) return;
    
    // Get or create AI session
    let session = global.aiSessions.get(m.from) || [];
    
    // Add user message to session
    session.push({
      role: 'user',
      content: m.body
    });
    
    // Keep only last 20 messages
    if (session.length > 20) {
      session = session.slice(-20);
    }
    
    try {
      const response = await aiManager.chat(session);
      
      // Add AI response to session
      session.push({
        role: 'assistant',
        content: response
      });
      
      global.aiSessions.set(m.from, session);
      
      await m.reply(response);
      
    } catch (error) {
      console.error('AI error:', error);
    }
  }
}

/**
 * Handle anti-delete
 */
async function handleAntiDelete(sock, update, deletedMsg) {
  const groupSettings = global.groupSettings.get(update.key.remoteJid) || {};
  
  if (groupSettings.antiDelete) {
    try {
      // Forward deleted message
      await sock.sendMessage(update.key.remoteJid, {
        text: `🗑️ *Anti-Delete Detection*\n\nDeleted message from @${update.key.participant.split('@')[0]}:`,
        mentions: [update.key.participant]
      });
      
      // Send the actual deleted message
      await sock.sendMessage(update.key.remoteJid, deletedMsg);
      
      // Log to Discord
      await discordLogger.logDeletedMessage({
        user: update.key.participant,
        message: deletedMsg,
        group: update.key.remoteJid,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Anti-delete error:', error);
    }
  }
}

/**
 * Handle group participant updates
 */
async function handleGroupUpdate(sock, update) {
  const { id, participants, action } = update;
  
  try {
    const groupSettings = global.groupSettings.get(id) || {
      welcome: true,
      goodbye: true,
      welcomeMessage: config.WELCOME_MESSAGE,
      goodbyeMessage: config.GOODBYE_MESSAGE
    };
    
    const groupMetadata = await sock.groupMetadata(id);
    
    if (action === 'add' && groupSettings.welcome) {
      for (const participant of participants) {
        const message = groupSettings.welcomeMessage
          .replace('@user', `@${participant.split('@')[0]}`)
          .replace('@group', groupMetadata.subject)
          .replace('@count', groupMetadata.participants.length);
        
        await sock.sendMessage(id, {
          text: message,
          mentions: [participant]
        });
        
        // Log to Discord
        await discordLogger.logJoin({
          user: participant,
          userName: participant.split('@')[0],
          group: groupMetadata.subject,
          memberCount: groupMetadata.participants.length,
          timestamp: new Date()
        });
      }
    }
    
    if (action === 'remove' && groupSettings.goodbye) {
      for (const participant of participants) {
        const message = groupSettings.goodbyeMessage
          .replace('@user', `@${participant.split('@')[0]}`)
          .replace('@group', groupMetadata.subject);
        
        await sock.sendMessage(id, {
          text: message,
          mentions: [participant]
        });
        
        // Log to Discord
        await discordLogger.logLeave({
          user: participant,
          userName: participant.split('@')[0],
          group: groupMetadata.subject,
          memberCount: groupMetadata.participants.length,
          timestamp: new Date()
        });
      }
    }
    
  } catch (error) {
    console.error('Group update error:', error);
  }
}

// Start bot
console.log(chalk.blue('🚀 Initializing Lobby Bot...'));
startBot().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});

// Handle errors
process.on('uncaughtException', (err) => {
  console.error(chalk.red('Uncaught Exception:'), err);
});

process.on('unhandledRejection', (err) => {
  console.error(chalk.red('Unhandled Rejection:'), err);
});
