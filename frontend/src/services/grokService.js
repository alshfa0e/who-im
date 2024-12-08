const GROK_API_KEY = 'xai-Vx1EEegDUkwDk8gyuPvgrXwwp5EJZ9friQl8nuPfyLhcxH6rq5Q809Sy8YlimWPKX41mPMesAkhHGqTC';
const API_URL = 'https://api.grok.ai/v1';

class GrokService {
    constructor() {
        this.headers = {
            'Authorization': `Bearer ${GROK_API_KEY}`,
            'Content-Type': 'application/json'
        };
        this.conversationContext = [];
    }

    async sendMessage(message, language = 'en') {
        try {
            const response = await fetch(`${API_URL}/chat/completions`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    messages: [
                        ...this.conversationContext,
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    model: 'grok-1',
                    temperature: 0.7,
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message;

            // Update conversation context
            this.conversationContext.push(
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse.content }
            );

            // Keep context manageable
            if (this.conversationContext.length > 10) {
                this.conversationContext = this.conversationContext.slice(-10);
            }

            return {
                message: aiResponse.content,
                progress: this.calculateProgress()
            };
        } catch (error) {
            console.error('Grok API Error:', error);
            throw error;
        }
    }

    calculateProgress() {
        // Calculate progress based on conversation length and quality
        const baseProgress = Math.min(
            (this.conversationContext.length / 10) * 100,
            100
        );
        return Math.round(baseProgress);
    }

    async generateSummary() {
        try {
            const response = await fetch(`${API_URL}/chat/completions`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    messages: [
                        ...this.conversationContext,
                        {
                            role: 'user',
                            content: 'Based on our conversation, can you provide a brief 4-line summary of my personality?'
                        }
                    ],
                    model: 'grok-1',
                    temperature: 0.5,
                    max_tokens: 150
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Summary Generation Error:', error);
            throw error;
        }
    }

    async generateFullReport() {
        try {
            const response = await fetch(`${API_URL}/chat/completions`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    messages: [
                        ...this.conversationContext,
                        {
                            role: 'user',
                            content: 'Please provide a detailed personality analysis report based on our conversation, including strengths, areas for growth, and recommendations.'
                        }
                    ],
                    model: 'grok-1',
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Report Generation Error:', error);
            throw error;
        }
    }

    resetContext() {
        this.conversationContext = [];
    }
}

export const grokService = new GrokService();