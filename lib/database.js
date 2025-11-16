// lib/database.js
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const crypto = require('crypto');
const config = require('../config');

class DatabaseManager {
  constructor() {
    this.type = (config.DATABASE && config.DATABASE.type) || 'json';
    this.path = (config.DATABASE && config.DATABASE.path) || './database/data.json';
    this._data = {};
    this._dirty = false;
    this._saveTimer = null;
  }

  async init() {
    if (this.type === 'mongodb') {
      // If the user later wants Mongo, you can implement here.
      console.log('[Database] MongoDB selected but not implemented. Falling back to json.');
    }

    // ensure dir exists
    const dir = path.dirname(this.path);
    await mkdirp(dir);

    // read file if exists
    try {
      if (fs.existsSync(this.path)) {
        const raw = fs.readFileSync(this.path, 'utf8');
        this._data = raw ? JSON.parse(raw) : {};
      } else {
        this._data = {};
        fs.writeFileSync(this.path, JSON.stringify(this._data, null, 2));
      }
      console.log(`[Database] JSON DB loaded: ${this.path}`);
    } catch (err) {
      console.error('[Database] Failed to read DB file, starting with empty DB:', err);
      this._data = {};
      fs.writeFileSync(this.path, JSON.stringify(this._data, null, 2));
    }

    // autosave every 5 seconds if dirty
    this._saveTimer = setInterval(() => {
      if (this._dirty) this._flush();
    }, 5000);

    return true;
  }

  _flush() {
    try {
      const backupPath = `${this.path}.bak`;
      if (fs.existsSync(this.path)) {
        fs.copyFileSync(this.path, backupPath);
      }
      fs.writeFileSync(this.path, JSON.stringify(this._data, null, 2));
      this._dirty = false;
      // rotate backups (simple)
      // keep one backup only
    } catch (err) {
      console.error('[Database] Failed to write DB file:', err);
    }
  }

  get(key, defaultValue = null) {
    return (this._data.hasOwnProperty(key)) ? this._data[key] : defaultValue;
  }

  set(key, value) {
    this._data[key] = value;
    this._dirty = true;
    return value;
  }

  has(key) {
    return this._data.hasOwnProperty(key);
  }

  delete(key) {
    if (this._data.hasOwnProperty(key)) {
      delete this._data[key];
      this._dirty = true;
      return true;
    }
    return false;
  }

  all() {
    return this._data;
  }

  async close() {
    if (this._saveTimer) clearInterval(this._saveTimer);
    this._flush();
  }
}

module.exports = { DatabaseManager };
