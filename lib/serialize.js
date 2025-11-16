// lib/serialize.js
const { getContentType, jidNormalizedUser } = require('@whiskeysockets/baileys');

async function serialize(sock, msg) {
  if (!msg.message) return msg;
  msg.type = getContentType(msg.message);
  msg.from = msg.key.remoteJid;
  msg.sender = jidNormalizedUser(msg.key.fromMe ? sock.user.id : msg.key.participant || msg.from);
  msg.isGroup = (msg.from || '').endsWith('@g.us');
  msg.pushName = msg.pushName || '';

  const body = msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption || '';
  msg.body = body;

  if (msg.message?.extendedTextMessage) {
    const ctx = msg.message.extendedTextMessage.contextInfo;
    msg.quoted = ctx?.quotedMessage || null;
    if (msg.quoted) {
      msg.quoted.sender = jidNormalizedUser(ctx?.participant || msg.key.participant || '');
      msg.quoted.text = msg.quoted.conversation || msg.quoted.extendedTextMessage?.text || '';
      msg.quoted.download = async () => await sock.downloadMediaMessage(msg.quoted).catch(() => null);
    }
  }

  msg.mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (msg.isGroup) {
    try {
      const groupMetadata = await sock.groupMetadata(msg.from).catch(() => null);
      if (groupMetadata) {
        msg.groupName = groupMetadata.subject;
        msg.participants = groupMetadata.participants;
        msg.admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
        msg.isAdmin = msg.admins.includes(msg.sender);
        msg.isBotAdmin = msg.admins.includes(jidNormalizedUser(sock.user.id));
      }
    } catch (e) {
      // ignore
    }
  }

  msg.reply = async (text, options = {}) => {
    const message = (typeof text === 'string') ? { text } : text;
    return await sock.sendMessage(msg.from, message, { quoted: msg, ...options }).catch(() => null);
  };

  msg.download = async () => await sock.downloadMediaMessage(msg).catch(() => null);

  return msg;
}

module.exports = { serialize };
