import { GEMINI_API_KEY, GEMINI_CONFIG } from './api-config.js';

export class ChatService {
    constructor() {
        this.apiKey = GEMINI_API_KEY;
        this.config = GEMINI_CONFIG;
        this.conversationHistory = [];
    }

    async sendMessage(message) {
        try {
            console.log('Sending message:', message);
            
            // Add user message to history
            this.conversationHistory.push({ role: 'user', content: message });

            // Prepare conversation history for context
            const conversationMessages = this.conversationHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));

            // Prepare the request body
            const requestBody = {
                contents: [{
                    parts: [{
                        text: message
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: this.config.maxTokens,
                    topP: 0.8,
                    topK: 40
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            };

            console.log('Request URL:', `${this.config.apiEndpoint}?key=${this.apiKey}`);
            console.log('Request body:', requestBody);

            // Send request to Gemini API
            const response = await fetch(`${this.config.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to get response from AI');
            }

            let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!aiResponse) {
                throw new Error('Invalid response format from AI');
            }

            // Clean up the response
            aiResponse = aiResponse.trim();
            
            // Add AI response to history
            this.conversationHistory.push({ role: 'assistant', content: aiResponse });

            return aiResponse;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    getConversationHistory() {
        return this.conversationHistory;
    }

    clearConversation() {
        this.conversationHistory = [];
    }
}
