// Chat Service Class
class ChatService {
    constructor() {
        this.sessionId = null;
        this.messages = [];
        this.currentLanguage = 'en';
        this.translations = {
            en: {
                welcomeMessage: "Hello! I'm here to help you discover more about your personality. Let's start with a simple question: What brings you here today?",
                typingMessage: "Thinking...",
                errorMessage: "I apologize, but I encountered an error. Let's try again.",
            },
            ar: {
                welcomeMessage: "مرحباً! أنا هنا لمساعدتك في اكتشاف المزيد عن شخصيتك. لنبدأ بسؤال بسيط: ما الذي يجلبك إلى هنا اليوم؟",
                typingMessage: "جاري التفكير...",
                errorMessage: "عذراً، لقد واجهت خطأ. دعنا نحاول مرة أخرى.",
            }
        };
        this.analysisProgress = 0;
    }

    async initialize(language = 'en') {
        this.currentLanguage = language;
        try {
            const response = await this.startNewSession();
            if (response.sessionId) {
                this.sessionId = response.sessionId;
                await this.addMessage('bot', this.translations[this.currentLanguage].welcomeMessage);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to initialize chat service:', error);
            return false;
        }
    }

    async startNewSession() {
        try {
            const response = await fetch('/api/chat/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error starting new session:', error);
            throw error;
        }
    }

    async sendMessage(message) {
        try {
            // Add user message to the conversation
            await this.addMessage('user', message);
            
            // Show typing indicator
            this.emit('typing', true);
            
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    message: message,
                    language: this.currentLanguage
                })
            });

            const data = await response.json();
            
            // Hide typing indicator
            this.emit('typing', false);

            if (data.response) {
                await this.addMessage('bot', data.response);
                this.updateAnalysisProgress(data.progress || 0);
            }

            return data;
        } catch (error) {
            console.error('Error sending message:', error);
            await this.addMessage('bot', this.translations[this.currentLanguage].errorMessage);
            this.emit('typing', false);
            throw error;
        }
    }

    async addMessage(role, content) {
        const message = {
            id: Date.now(),
            role,
            content,
            timestamp: new Date().toISOString()
        };
        this.messages.push(message);
        this.emit('messageAdded', message);
        return message;
    }

    async getFreeSummary() {
        try {
            const response = await fetch(`/api/chat/summary?sessionId=${this.sessionId}`);
            const data = await response.json();
            
            if (data.summary) {
                await this.addMessage('bot', data.summary);
                this.emit('summaryReady', data.summary);
            }
            
            return data.summary;
        } catch (error) {
            console.error('Error getting free summary:', error);
            throw error;
        }
    }

    async getFullReport() {
        try {
            const response = await fetch('/api/chat/full-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId
                })
            });
            const data = await response.json();
            
            if (data.report) {
                this.emit('reportReady', data.report);
            }
            
            return data.report;
        } catch (error) {
            console.error('Error getting full report:', error);
            throw error;
        }
    }

    updateAnalysisProgress(progress) {
        this.analysisProgress = progress;
        this.emit('progressUpdated', progress);
    }

    setLanguage(language) {
        this.currentLanguage = language;
        this.emit('languageChanged', language);
    }

    // Simple event system
    eventListeners = {};

    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }

    // Clear chat history
    clearChat() {
        this.messages = [];
        this.analysisProgress = 0;
        this.emit('chatCleared');
    }

    // Get chat history
    getMessages() {
        return this.messages;
    }

    // Get current progress
    getProgress() {
        return this.analysisProgress;
    }
}

// Export a singleton instance
export const chatService = new ChatService();