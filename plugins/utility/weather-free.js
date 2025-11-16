module.exports = {
  type: 'command',
  name: 'weather',
  category: 'UTILITY',
  description: 'Get weather info',
  usage: 'weather <city>',
  async execute(sock, m, args) {
    if (!args.length) return m.reply('Provide city name!');
    
    await m.reply('🌤️ Fetching weather...');
    
    try {
      const fetch = require('node-fetch');
      const city = args.join(' ');
      // Using free weather API (no key required)
      const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      const data = await response.json();
      
      const current = data.current_condition[0];
      const location = data.nearest_area[0];
      
      const text = `
🌍 *Weather Report*

📍 Location: ${location.areaName[0].value}, ${location.country[0].value}
🌡️ Temperature: ${current.temp_C}°C / ${current.temp_F}°F
☁️ Condition: ${current.weatherDesc[0].value}
💨 Wind: ${current.windspeedKmph} km/h
💧 Humidity: ${current.humidity}%
👁️ Visibility: ${current.visibility} km
      `.trim();
      
      m.reply(text);
    } catch (error) {
      m.reply('❌ City not found or service error!');
    }
  }
};