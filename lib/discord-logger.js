/**
 * DISCORD WEBHOOK LOGGER
 * Logs everything to Discord with beautiful embeds
 */

const axios = require('axios');
const config = require('../config');

class DiscordLogger {
  constructor(webhooks) {
    this.webhooks = webhooks;
    this.enabled = Object.values(webhooks).some(url => url && url.length > 0);
  }
  
  async init() {
    if (!this.enabled) {
      console.log('⚠️  Discord logging disabled (no webhooks configured)');
      return;
    }
    
    // Test webhooks
    let activeWebhooks = 0;
    for (const [name, url] of Object.entries(this.webhooks)) {
      if (url && url.length > 0) {
        activeWebhooks++;
      }
    }
    
    console.log(`✓ Discord logger ready (${activeWebhooks} webhooks configured)`);
  }
  
  /**
   * Send embed to Discord
   */
  async sendEmbed(webhookUrl, embed) {
    if (!webhookUrl || webhookUrl.length === 0) return;
    
    try {
      await axios.post(webhookUrl, {
        embeds: [embed],
        username: config.BOT_NAME,
        avatar_url: 'https://i.ibb.co/XYZ/bot-avatar.png' // Your bot avatar
      });
    } catch (error) {
      console.error('Discord webhook error:', error.message);
    }
  }
  
  /**
   * Log message
   */
  async logMessage(m) {
    if (!m.body) return;
    
    const embed = {
      title: '💬 New Message',
      color: config.EMBED_COLORS.INFO,
      fields: [
        {
          name: '👤 User',
          value: `${m.pushName || 'Unknown'}\n\`${m.sender}\``,
          inline: true
        },
        {
          name: '📍 Chat',
          value: m.isGroup ? `${m.groupName}\n\`${m.from}\`` : 'Private Chat',
          inline: true
        },
        {
          name: '💬 Message',
          value: m.body.substring(0, 1000) || 'No text',
          inline: false
        }
      ],
      footer: {
        text: `${m.isGroup ? 'Group' : 'Private'} Message`
      },
      timestamp: new Date().toISOString()
    };
    
    // Add media info if present
    if (m.type === 'imageMessage') {
      embed.fields.push({
        name: '📎 Media',
        value: '🖼️ Image',
        inline: true
      });
    } else if (m.type === 'videoMessage') {
      embed.fields.push({
        name: '📎 Media',
        value: '🎥 Video',
        inline: true
      });
    } else if (m.type === 'audioMessage') {
      embed.fields.push({
        name: '📎 Media',
        value: '🎵 Audio',
        inline: true
      });
    }
    
    await this.sendEmbed(this.webhooks.MESSAGES, embed);
  }
  
  /**
   * Log command usage
   */
  async logCommand(data) {
    const embed = {
      title: '⚡ Command Executed',
      color: config.EMBED_COLORS.SUCCESS,
      fields: [
        {
          name: '👤 User',
          value: `${data.user}\n\`${data.userId}\``,
          inline: true
        },
        {
          name: '📍 Location',
          value: data.group || 'Private',
          inline: true
        },
        {
          name: '💻 Command',
          value: `\`${data.command}\``,
          inline: true
        }
      ],
      timestamp: data.timestamp.toISOString()
    };
    
    if (data.args) {
      embed.fields.push({
        name: '📝 Arguments',
        value: `\`${data.args}\`` || 'None',
        inline: false
      });
    }
    
    await this.sendEmbed(this.webhooks.COMMANDS, embed);
  }
  
  /**
   * Log lobby creation
   */
  async logLobbyCreated(data) {
    const embed = {
      title: '🎮 Lobby Created!',
      description: data.description,
      color: config.EMBED_COLORS.LOBBY,
      fields: [
        {
          name: '🏷️ Name',
          value: data.name,
          inline: true
        },
        {
          name: '🆔 Group ID',
          value: `\`${data.groupId}\``,
          inline: true
        },
        {
          name: '🔗 Invite Link',
          value: `[Click to Join](${data.inviteLink})`,
          inline: false
        }
      ],
      thumbnail: {
        url: 'https://i.ibb.co/XYZ/lobby-icon.png' // Lobby icon
      },
      timestamp: data.timestamp.toISOString(),
      footer: {
        text: data.custom ? 'Custom Lobby' : 'Scheduled Lobby'
      }
    };
    
    await this.sendEmbed(this.webhooks.GROUPS, embed);
    await this.sendEmbed(this.webhooks.MAIN, embed);
  }
  
  /**
   * Log user join
   */
  async logJoin(data) {
    const embed = {
      title: '👋 User Joined',
      color: 0x00ff00,
      fields: [
        {
          name: '👤 User',
          value: `${data.userName}\n\`${data.user}\``,
          inline: true
        },
        {
          name: '👥 Group',
          value: data.group,
          inline: true
        },
        {
          name: '📊 Members',
          value: `${data.memberCount} members`,
          inline: true
        }
      ],
      timestamp: data.timestamp.toISOString()
    };
    
    await this.sendEmbed(this.webhooks.JOIN_LEAVE, embed);
  }
  
  /**
   * Log user leave
   */
  async logLeave(data) {
    const embed = {
      title: '👋 User Left',
      color: 0xff0000,
      fields: [
        {
          name: '👤 User',
          value: `${data.userName}\n\`${data.user}\``,
          inline: true
        },
        {
          name: '👥 Group',
          value: data.group,
          inline: true
        },
        {
          name: '📊 Members',
          value: `${data.memberCount} members`,
          inline: true
        }
      ],
      timestamp: data.timestamp.toISOString()
    };
    
    await this.sendEmbed(this.webhooks.JOIN_LEAVE, embed);
  }
  
  /**
   * Log deleted message
   */
  async logDeletedMessage(data) {
    const embed = {
      title: '🗑️ Message Deleted',
      color: 0xff0000,
      description: '**Anti-Delete Detection**',
      fields: [
        {
          name: '👤 User',
          value: `\`${data.user}\``,
          inline: true
        },
        {
          name: '👥 Group',
          value: `\`${data.group}\``,
          inline: true
        },
        {
          name: '💬 Deleted Message',
          value: this.getMessageText(data.message) || 'Media/No text',
          inline: false
        }
      ],
      timestamp: data.timestamp.toISOString()
    };
    
    await this.sendEmbed(this.webhooks.DELETED, embed);
  }
  
  /**
   * Log profile picture change
   */
  async logProfilePicture(data) {
    const embed = {
      title: '📸 Profile Picture Changed',
      color: config.EMBED_COLORS.INFO,
      fields: [
        {
          name: '👤 User',
          value: `${data.name}\n\`${data.jid}\``,
          inline: false
        }
      ],
      image: {
        url: data.url
      },
      timestamp: new Date().toISOString()
    };
    
    await this.sendEmbed(this.webhooks.PROFILE_PIC, embed);
  }
  
  /**
   * Log status/story
   */
  async logStatus(msg) {
    const text = this.getMessageText(msg.message);
    
    const embed = {
      title: '📱 New Status',
      color: config.EMBED_COLORS.INFO,
      fields: [
        {
          name: '👤 User',
          value: msg.pushName || 'Unknown',
          inline: true
        },
        {
          name: '💬 Content',
          value: text || 'Media status',
          inline: false
        }
      ],
      timestamp: new Date().toISOString()
    };
    
    await this.sendEmbed(this.webhooks.STATUS, embed);
  }
  
  /**
   * Log error
   */
  async logError(data) {
    const embed = {
      title: '❌ Error Occurred',
      color: config.EMBED_COLORS.ERROR,
      fields: [
        {
          name: '🐛 Error',
          value: `\`\`\`${data.error}\`\`\``,
          inline: false
        }
      ],
      timestamp: data.timestamp ? data.timestamp.toISOString() : new Date().toISOString()
    };
    
    if (data.command) {
      embed.fields.unshift({
        name: '💻 Command',
        value: `\`${data.command}\``,
        inline: true
      });
    }
    
    if (data.user) {
      embed.fields.unshift({
        name: '👤 User',
        value: data.user,
        inline: true
      });
    }
    
    await this.sendEmbed(this.webhooks.ERRORS, embed);
  }
  
  /**
   * Log system event
   */
  async logSystem(data) {
    const embed = {
      title: data.title || '🔔 System Event',
      description: data.description,
      color: data.color || config.EMBED_COLORS.INFO,
      timestamp: data.timestamp ? data.timestamp.toISOString() : new Date().toISOString()
    };
    
    if (data.fields) {
      embed.fields = data.fields;
    }
    
    await this.sendEmbed(this.webhooks.SYSTEM, embed);
  }
  
  /**
   * Helper: Extract message text
   */
  getMessageText(message) {
    return message?.conversation ||
           message?.extendedTextMessage?.text ||
           message?.imageMessage?.caption ||
           message?.videoMessage?.caption ||
           '';
  }
}

module.exports = { DiscordLogger };