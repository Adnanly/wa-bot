/**
 * AUTO-INSTALLER FOR ULTIMATE WHATSAPP BOT
 * Run: node installer.js
 * This will automatically create all files and folders!
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log(`
╔════════════════════════════════════════╗
║   ULTIMATE WHATSAPP BOT INSTALLER      ║
║   Auto-setup all files & folders       ║
╚════════════════════════════════════════╝
`);

async function install() {
  console.log('\n📦 Starting installation...\n');

  // 1. Create directories
  console.log('📁 Creating directories...');
  const dirs = [
    'lib',
    'plugins/admin',
    'plugins/ai',
    'plugins/downloader',
    'plugins/fun',
    'plugins/game',
    'plugins/info',
    'plugins/sticker',
    'plugins/utility',
    'plugins/search',
    'plugins/group',
    'plugins/events',
    'session',
    'database'
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  ✓ Created ${dir}`);
    }
  }

  // 2. Get user input
  console.log('\n⚙️  Bot Configuration\n');
  const botName = await question('Bot Name (default: Ultimate Bot): ') || 'Ultimate Bot';
  const prefix = await question('Command Prefix (default: .): ') || '.';
  const ownerNumber = await question('Your WhatsApp Number (with country code): ') || '919876543210';
  const geminiKey = await question('Gemini API Key (optional, press Enter to skip): ') || '';

  // 3. Create .env file
  console.log('\n📝 Creating .env file...');
  const envContent = `# Bot Configuration
BOT_NAME=${botName}
PREFIX=${prefix}
SELF_MODE=false
PAIRING_MODE=code

# Owner
OWNER_NUMBERS=${ownerNumber}
OWNER_NAME=Owner

# FREE API Keys (Optional)
GEMINI_API_KEY=${geminiKey}
HUGGINGFACE_API_KEY=
WEATHER_API_KEY=

# Other APIs (Not required)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
REMOVE_BG_API_KEY=

# Limits
DAILY_LIMIT=50
MAX_WARNINGS=3

# Features
ENABLE_AI=true
ENABLE_GAMES=true
ENABLE_FUN=true

# Media
STICKER_AUTHOR=${botName}
STICKER_PACK=Bot Stickers

# Other
TIMEZONE=Asia/Kolkata
LANGUAGE=en
`;
  fs.writeFileSync('.env', envContent);
  console.log('  ✓ .env created');

  // 4. Create config.js
  console.log('📝 Creating config.js...');
  const configContent = `require('dotenv').config();

module.exports = {
  BOT_NAME: process.env.BOT_NAME || 'Ultimate Bot',
  PREFIX: process.env.PREFIX || '.',
  SELF_MODE: process.env.SELF_MODE === 'true',
  PAIRING_MODE: process.env.PAIRING_MODE || 'code',
  
  OWNER_NUMBERS: (process.env.OWNER_NUMBERS || '').split(',').filter(Boolean),
  OWNER_NAME: process.env.OWNER_NAME || 'Owner',
  
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
  
  DAILY_LIMIT: parseInt(process.env.DAILY_LIMIT) || 50,
  MAX_WARNINGS: parseInt(process.env.MAX_WARNINGS) || 3,
  
  ENABLE_AI: process.env.ENABLE_AI !== 'false',
  ENABLE_GAMES: process.env.ENABLE_GAMES !== 'false',
  ENABLE_FUN: process.env.ENABLE_FUN !== 'false',
  
  STICKER_AUTHOR: process.env.STICKER_AUTHOR || 'Ultimate Bot',
  STICKER_PACK: process.env.STICKER_PACK || 'Bot Stickers',
  
  TIMEZONE: process.env.TIMEZONE || 'Asia/Kolkata',
  LANGUAGE: process.env.LANGUAGE || 'en'
};`;
  fs.writeFileSync('config.js', configContent);
  console.log('  ✓ config.js created');

  // 5. Create .gitignore
  console.log('📝 Creating .gitignore...');
  const gitignoreContent = `node_modules/
session/
.env
*.log
database/
package-lock.json
.DS_Store`;
  fs.writeFileSync('.gitignore', gitignoreContent);
  console.log('  ✓ .gitignore created');

  // 6. Create lib files
  console.log('📝 Creating library files...');
  
  // lib/plugins.js
  const pluginsContent = `const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

async function loadPlugins() {
  const pluginsDir = path.join(__dirname, '..', 'plugins');
  try {
    const categories = await fs.readdir(pluginsDir);
    for (const category of categories) {
      const categoryPath = path.join(pluginsDir, category);
      const stat = await fs.stat(categoryPath);
      if (!stat.isDirectory()) continue;
      const files = await fs.readdir(categoryPath);
      for (const file of files) {
        if (!file.endsWith('.js')) continue;
        try {
          const filePath = path.join(categoryPath, file);
          delete require.cache[require.resolve(filePath)];
          const plugin = require(filePath);
          if (plugin.type === 'command') registerCommand(plugin, category);
          else if (plugin.type === 'event') registerEvent(plugin);
        } catch (error) {
          console.error(chalk.red(\`Failed to load \${file}:\`), error.message);
        }
      }
    }
  } catch (error) {
    console.error(chalk.red('Failed to load plugins:'), error);
  }
}

function registerCommand(plugin, category) {
  if (!plugin.name) return;
  const command = {
    ...plugin,
    category: category.toUpperCase(),
    aliases: plugin.aliases || [],
    cooldown: plugin.cooldown || 3
  };
  global.commands.set(command.name, command);
  for (const alias of command.aliases) {
    global.commands.set(alias, command);
  }
}

function registerEvent(plugin) {
  if (!plugin.name) return;
  global.events.set(plugin.name, plugin);
}

module.exports = { loadPlugins, registerCommand, registerEvent };`;
  fs.writeFileSync('lib/plugins.js', pluginsContent);

  // lib/serialize.js
  const serializeContent = `const { getContentType, jidNormalizedUser } = require('@whiskeysockets/baileys');

async function serialize(sock, msg) {
  if (!msg.message) return msg;
  msg.type = getContentType(msg.message);
  msg.from = msg.key.remoteJid;
  msg.sender = jidNormalizedUser(msg.key.fromMe ? sock.user.id : msg.key.participant || msg.from);
  msg.isGroup = msg.from.endsWith('@g.us');
  msg.pushName = msg.pushName || '';
  
  const body = msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption || '';
  msg.body = body;
  
  if (msg.message?.extendedTextMessage) {
    msg.quoted = msg.message.extendedTextMessage.contextInfo?.quotedMessage;
    if (msg.quoted) {
      msg.quoted.sender = jidNormalizedUser(msg.message.extendedTextMessage.contextInfo?.participant);
      msg.quoted.text = msg.quoted.conversation || msg.quoted.extendedTextMessage?.text || '';
      msg.quoted.download = async () => await sock.downloadMediaMessage(msg.quoted);
    }
  }
  
  msg.mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  
  if (msg.isGroup) {
    const groupMetadata = await sock.groupMetadata(msg.from).catch(() => null);
    if (groupMetadata) {
      msg.groupName = groupMetadata.subject;
      msg.participants = groupMetadata.participants;
      msg.admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
      msg.isAdmin = msg.admins.includes(msg.sender);
      msg.isBotAdmin = msg.admins.includes(jidNormalizedUser(sock.user.id));
    }
  }
  
  msg.reply = async (text, options = {}) => {
    return await sock.sendMessage(msg.from, { text, ...options }, { quoted: msg });
  };
  
  msg.download = async () => await sock.downloadMediaMessage(msg);
  
  return msg;
}

module.exports = { serialize };`;
  fs.writeFileSync('lib/serialize.js', serializeContent);

  // lib/database.js
  fs.writeFileSync('lib/database.js', `async function initDatabase() {
  console.log('Database initialized');
  return true;
}
module.exports = { initDatabase };`);

  // lib/cache.js
  fs.writeFileSync('lib/cache.js', `async function initCache() {
  return new Map();
}
module.exports = { initCache };`);

  console.log('  ✓ Library files created');

  // 7. Create sample plugins
  console.log('📝 Creating sample commands...');
  
  // Create menu command
  const menuCommand = `const config = require('../../config');

module.exports = {
  type: 'command',
  name: 'menu',
  aliases: ['help', 'commands'],
  category: 'INFO',
  description: 'Show all commands',
  async execute(sock, m, args) {
    const categories = {};
    for (const [name, cmd] of global.commands) {
      if (cmd.name !== name) continue;
      if (!categories[cmd.category]) categories[cmd.category] = [];
      categories[cmd.category].push(cmd);
    }
    
    let text = \`╭━━『 *\${config.BOT_NAME}* 』━━╮\\n\`;
    text += \`│ 👤 User: \${m.pushName}\\n\`;
    text += \`│ 🤖 Commands: \${global.commands.size}\\n\`;
    text += \`╰━━━━━━━━━━━━━━╯\\n\\n\`;
    
    for (const [category, cmds] of Object.entries(categories)) {
      text += \`┏━━『 \${category} 』\\n\`;
      for (const cmd of cmds) {
        text += \`┃ • \${config.PREFIX}\${cmd.name}\\n\`;
      }
      text += \`┗━━━━━━━━━━━━\\n\\n\`;
    }
    
    text += \`_Type \${config.PREFIX}help <command> for details_\`;
    m.reply(text);
  }
};`;
  fs.writeFileSync('plugins/info/menu.js', menuCommand);

  // Create ping command
  const pingCommand = `module.exports = {
  type: 'command',
  name: 'ping',
  category: 'INFO',
  description: 'Check bot speed',
  async execute(sock, m, args) {
    const start = Date.now();
    await m.reply('🏓 Pinging...');
    const end = Date.now();
    m.reply(\`🏓 Pong! Speed: \${end - start}ms\`);
  }
};`;
  fs.writeFileSync('plugins/info/ping.js', pingCommand);

  // Create AI command (free Gemini)
  const aiCommand = `const config = require('../../config');

module.exports = {
  type: 'command',
  name: 'ai',
  aliases: ['gemini', 'ask'],
  category: 'AI',
  description: 'Chat with free AI',
  usage: 'ai <question>',
  cooldown: 5,
  async execute(sock, m, args) {
    if (!args.length) return m.reply('Ask something!');
    if (!config.GEMINI_API_KEY) {
      return m.reply('Get free Gemini API at:\\nhttps://makersuite.google.com/app/apikey');
    }
    
    await m.reply('🤖 Thinking...');
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(args.join(' '));
      const text = result.response.text();
      m.reply(\`🤖 *AI:*\\n\\n\${text}\`);
    } catch (error) {
      m.reply('❌ Error! Check API key.');
    }
  }
};`;
  fs.writeFileSync('plugins/ai/gemini.js', aiCommand);

  console.log('  ✓ Sample commands created');

  // 8. Show completion message
  console.log('\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║  ✅ INSTALLATION COMPLETE!             ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('\n📋 Next steps:\n');
  console.log('1. Install dependencies:');
  console.log('   npm install\n');
  console.log('2. Start the bot:');
  console.log('   npm start\n');
  console.log('3. Scan QR or use pairing code\n');
  
  if (!geminiKey) {
    console.log('💡 TIP: Get FREE Gemini API for AI features:');
    console.log('   https://makersuite.google.com/app/apikey\n');
  }
  
  console.log('📚 All commands will be in plugins/ folder');
  console.log('🎉 Your bot is ready to go!\n');

  rl.close();
}

// Run installer
install().catch(console.error);