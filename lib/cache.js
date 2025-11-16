async function initCache() {
  console.log('Cache initialized');
  return new Map();
}

module.exports = { initCache };