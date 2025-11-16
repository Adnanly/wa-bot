/**
 * AI MANAGER
 * Groq AI integration for chat assistant
 */

const axios = require('axios');
const config = require('../config');

class AIManager {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = config.GROQ_MODEL || 'llama-3.1-70b-versatile';
    this.systemPrompt = config.AI_SYSTEM_PROMPT;
  }
  
  /**
   * Chat with AI
   */
  async chat(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
    }
    
    try {
      // Prepare messages with system prompt
      const fullMessages = [
        {
          role: 'system',
          content: options.systemPrompt || this.systemPrompt
        },
        ...messages
      ];
      
      const response = await axios.post(
        this.baseURL,
        {
          model: options.model || this.model,
          messages: fullMessages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 500,
          top_p: options.topP || 0.9,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      return response.data.choices[0].message.content;
      
    } catch (error) {
      console.error('Groq API error:', error.message);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      
      throw new Error('AI service error');
    }
  }
  
  /**
   * Single message completion
   */
  async complete(prompt, options = {}) {
    return await this.chat([
      { role: 'user', content: prompt }
    ], options);
  }
  
  /**
   * Gaming assistant (specialized for lobby bot)
   */
  async gamingAssistant(query) {
    const systemPrompt = `You are a gaming lobby assistant. Help with:
- Game rules and strategies
- Lobby information
- Tournament schedules
- Fair play guidelines
- Player assistance

Be friendly, concise, and gaming-focused. Use gaming emojis 🎮🏆🎯`;
    
    return await this.complete(query, { systemPrompt });
  }
  
  /**
   * Moderation assistant
   */
  async moderationCheck(message) {
    const prompt = `Analyze this message for:
- Offensive language
- Spam
- Inappropriate content
- Rule violations

Message: "${message}"

Respond with JSON: {"flagged": true/false, "reason": "...", "severity": "low/medium/high"}`;
    
    try {
      const response = await this.complete(prompt);
      return JSON.parse(response);
    } catch (error) {
      return { flagged: false, reason: 'Unable to analyze', severity: 'low' };
    }
  }
  
  /**
   * Generate lobby description
   */
  async generateLobbyDescription(lobbyName, time, duration) {
    const prompt = `Create an exciting WhatsApp group description for a gaming lobby:
- Name: ${lobbyName}
- Time: ${time}
- Duration: ${duration} minutes

Include emojis, be exciting but professional. Max 150 characters.`;
    
    return await this.complete(prompt);
  }
  
  /**
   * Get AI response with context
   */
  async getContextualResponse(userMessage, context = {}) {
    let systemPrompt = this.systemPrompt;
    
    if (context.groupName) {
      systemPrompt += `\nYou are in the group: ${context.groupName}`;
    }
    
    if (context.userName) {
      systemPrompt += `\nTalking to: ${context.userName}`;
    }
    
    return await this.complete(userMessage, { systemPrompt });
  }
}

module.exports = { AIManager };