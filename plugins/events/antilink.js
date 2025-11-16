// plugins/events/antilink.js
module.exports = {
  name: 'antilink',
  condition: (m) => {
    try {
      if (!m) return false;
      // If this event is group-only
      if (!m.isGroup) return false;

      // Safely get settings (avoid undefined)
      const gsMap = global.groupSettings;
      if (!gsMap || typeof gsMap.get !== 'function') return false;
      const groupSettings = gsMap.get(m.from);
      if (!groupSettings) return false;

      // If your logic expects a 'groups' property, check it safely
      if (!groupSettings.groups || !Array.isArray(groupSettings.groups)) return false;

      // Check that message body exists and contains a link
      if (!m.body || typeof m.body !== 'string') return false;
      const hasLink = /https?:\/\/|t\.me\/|discord\.gg\/|wa\.me\//i.test(m.body);

      // Only trigger when anti-link is enabled for this group
      if (!groupSettings.antiLinkEnabled) return false;

      return hasLink;
    } catch (err) {
      console.error('antilink condition error:', err);
      return false;
    }
  },

  execute: async (sock, m) => {
    // existing implementation
  }
};
