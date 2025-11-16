/**
 * LOBBY MANAGER
 * Automatically creates WhatsApp groups at scheduled times
 */

const cron = require('node-cron');
const moment = require('moment-timezone');
const chalk = require('chalk');
const config = require('../config');

class LobbyManager {
  constructor(sock, discordLogger) {
    this.sock = sock;
    this.discordLogger = discordLogger;
    this.scheduledJobs = [];
    this.createdLobbies = new Map();
  }
  
  /**
   * Start the lobby scheduler
   */
  async startScheduler() {
    console.log(chalk.cyan('📅 Setting up lobby schedules...'));
    
    for (const lobby of config.LOBBIES) {
      const job = cron.schedule(lobby.time, async () => {
        await this.createLobby(lobby);
      }, {
        scheduled: true,
        timezone: config.TIMEZONE
      });
      
      this.scheduledJobs.push({ job, lobby });
      console.log(chalk.green(`  ✓ Scheduled: ${lobby.name} at ${lobby.time}`));
    }
    
    console.log(chalk.green(`✓ ${this.scheduledJobs.length} lobbies scheduled`));
    console.log('');
  }
  
  /**
   * Create a lobby group
   */
  async createLobby(lobbyConfig) {
    try {
      console.log(chalk.yellow(`🎮 Creating lobby: ${lobbyConfig.name}`));
      
      // Create the group
      const group = await this.sock.groupCreate(lobbyConfig.name, []);
      const groupId = group.gid;
      
      console.log(chalk.green(`✓ Lobby created: ${groupId}`));
      
      // Wait a bit for group to be fully created
      await this.delay(2000);
      
      // Send description/rules
      await this.sock.sendMessage(groupId, {
        text: lobbyConfig.description
      });
      
      // Wait a bit
      await this.delay(1000);
      
      // Send rules
      await this.sock.sendMessage(groupId, {
        text: config.LOBBY_RULES
      });
      
      // Store lobby info
      this.createdLobbies.set(groupId, {
        name: lobbyConfig.name,
        createdAt: new Date(),
        config: lobbyConfig
      });
      
      // Get group invite link
      const inviteCode = await this.sock.groupInviteCode(groupId);
      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
      
      // Log to Discord
      await this.discordLogger.logLobbyCreated({
        name: lobbyConfig.name,
        groupId: groupId,
        inviteLink: inviteLink,
        description: lobbyConfig.description,
        timestamp: new Date()
      });
      
      console.log(chalk.green(`✓ Lobby setup complete: ${lobbyConfig.name}`));
      console.log(chalk.cyan(`  Link: ${inviteLink}`));
      console.log('');
      
      return { groupId, inviteLink };
      
    } catch (error) {
      console.error(chalk.red(`Error creating lobby ${lobbyConfig.name}:`), error);
      
      // Log error to Discord
      await this.discordLogger.logError({
        title: 'Lobby Creation Failed',
        error: error.message,
        lobby: lobbyConfig.name,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Manual lobby creation
   */
  async createCustomLobby(name, description) {
    try {
      const group = await this.sock.groupCreate(name, []);
      const groupId = group.gid;
      
      await this.delay(2000);
      
      if (description) {
        await this.sock.sendMessage(groupId, { text: description });
        await this.delay(1000);
      }
      
      await this.sock.sendMessage(groupId, { text: config.LOBBY_RULES });
      
      const inviteCode = await this.sock.groupInviteCode(groupId);
      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
      
      this.createdLobbies.set(groupId, {
        name: name,
        createdAt: new Date(),
        custom: true
      });
      
      await this.discordLogger.logLobbyCreated({
        name: name,
        groupId: groupId,
        inviteLink: inviteLink,
        description: description || 'Custom lobby',
        custom: true,
        timestamp: new Date()
      });
      
      return { groupId, inviteLink };
      
    } catch (error) {
      console.error('Error creating custom lobby:', error);
      throw error;
    }
  }
  
  /**
   * Get lobby statistics
   */
  getLobbyStats() {
    const now = new Date();
    const today = this.createdLobbies.size;
    
    return {
      totalCreated: this.createdLobbies.size,
      scheduledJobs: this.scheduledJobs.length,
      activeLobbies: Array.from(this.createdLobbies.values())
    };
  }
  
  /**
   * Delete old lobbies (cleanup)
   */
  async cleanupOldLobbies(hoursOld = 24) {
    const cutoffTime = Date.now() - (hoursOld * 60 * 60 * 1000);
    const toDelete = [];
    
    for (const [groupId, lobby] of this.createdLobbies) {
      if (lobby.createdAt.getTime() < cutoffTime) {
        toDelete.push(groupId);
      }
    }
    
    for (const groupId of toDelete) {
      try {
        await this.sock.groupLeave(groupId);
        this.createdLobbies.delete(groupId);
        console.log(chalk.yellow(`🗑️ Cleaned up old lobby: ${groupId}`));
      } catch (error) {
        console.error('Error cleaning lobby:', error);
      }
    }
    
    return toDelete.length;
  }
  
  /**
   * Get next scheduled lobby
   */
  getNextLobby() {
    const now = moment().tz(config.TIMEZONE);
    let nextLobby = null;
    let minDiff = Infinity;
    
    for (const { lobby } of this.scheduledJobs) {
      // Parse cron time
      const cronParts = lobby.time.split(' ');
      const hour = parseInt(cronParts[1]);
      
      let nextTime = moment().tz(config.TIMEZONE).hour(hour).minute(0).second(0);
      
      if (nextTime.isBefore(now)) {
        nextTime.add(1, 'day');
      }
      
      const diff = nextTime.diff(now);
      
      if (diff < minDiff) {
        minDiff = diff;
        nextLobby = {
          name: lobby.name,
          time: nextTime.format('hh:mm A'),
          timeUntil: moment.duration(diff).humanize()
        };
      }
    }
    
    return nextLobby;
  }
  
  /**
   * Stop all schedulers
   */
  stopAll() {
    for (const { job } of this.scheduledJobs) {
      job.stop();
    }
    console.log(chalk.yellow('⏸️  All lobby schedulers stopped'));
  }
  
  /**
   * Restart all schedulers
   */
  restartAll() {
    for (const { job } of this.scheduledJobs) {
      job.start();
    }
    console.log(chalk.green('▶️  All lobby schedulers restarted'));
  }
  
  /**
   * Helper: delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { LobbyManager };