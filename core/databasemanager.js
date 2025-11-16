// core/DatabaseManager.js
const fs = require('fs').promises;
const path = require('path');

class DatabaseManager {
  constructor(config = {}) {
    this.filePath = path.resolve(config.path || './database/data.json');
    this._store = {};
    this._writing = false;
    this._dirty = false;
  }

  async init() {
    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      const raw = await fs.readFile(this.filePath, 'utf8').catch(() => null);
      if (raw) {
        try {
          this._store = JSON.parse(raw);
        } catch (e) {
          this._store = {};
          await this._writeFile();
        }
      } else {
        this._store = {};
        await this._writeFile();
      }
      console.log(`DatabaseManager: loaded JSON DB (${this.filePath})`);
      return true;
    } catch (err) {
      console.error('DatabaseManager.init error:', err);
      throw err;
    }
  }

  async _writeFile() {
    if (this._writing) {
      this._dirty = true;
      return;
    }
    this._writing = true;
    try {
      await fs.writeFile(this.filePath, JSON.stringify(this._store, null, 2), 'utf8');
      this._dirty = false;
    } catch (err) {
      console.error('DatabaseManager._writeFile error:', err);
      throw err;
    } finally {
      this._writing = false;
      if (this._dirty) {
        this._dirty = false;
        await this._writeFile();
      }
    }
  }

  async get(key, defaultValue = null) {
    return Object.prototype.hasOwnProperty.call(this._store, key) ? this._store[key] : defaultValue;
  }

  async set(key, value) {
    this._store[key] = value;
    await this._writeFile();
    return true;
  }

  async delete(key) {
    if (Object.prototype.hasOwnProperty.call(this._store, key)) {
      delete this._store[key];
      await this._writeFile();
      return true;
    }
    return false;
  }

  async all() {
    return { ...this._store };
  }

  async clear() {
    this._store = {};
    await this._writeFile();
  }

  async close() {
    return true;
  }
}

// Export both default and named so require() works both ways:
// 1) const DatabaseManager = require('./core/DatabaseManager')
// 2) const { DatabaseManager } = require('./core/DatabaseManager')
module.exports = DatabaseManager;
module.exports.DatabaseManager = DatabaseManager;
