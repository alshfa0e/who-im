import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chat';

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [progress, setProgress] = useState(0);
    const messagesEndRef = useRef(null);

    // Translations
    const translations = {
        en: {
            inputPlaceholder: "Type your message...",
            sendButton: "Send",
            typingIndicator: "Typing...",
            progressLabel: "Analysis Progress:"
        },
        ar: {
            inputPlaceholder: "اكتب رسالتك...",
            sendButton: "إرسال",
            typingIndicator: "يكتب...",
            progressLabel: "تقدم التحليل:"
        }
    };

    const [currentLang, setCurrentLang] = useState('en');

    useEffect(() => {
        // Initialize chat service
        chatService.initialize(currentLang);

        // Set up event listeners
        chatService.on('messageAdded', (message) => {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        });

        chatService.on('typing', setIsTyping);
        chatService.on('progressUpdated', setProgress);
        chatService.on('languageChanged', setCurrentLang);

        // Load existing messages if any
        setMessages(chatService.getMessages());
        setProgress(chatService.getProgress());

        return () => {
            // Cleanup event listeners
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        setInputText('');
        try {
            await chatService.sendMessage(inputText);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const renderMessage = (message) => {
        const messageClass = `message ${message.role}-message`;
        return (
            <div key={message.id} className={messageClass}>
                <div className="message-content">{message.content}</div>
                <div className="message-timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                </div>
            </div>
        );
    };

    const renderProgressBar = () => {
        if (progress > 0) {
            return (
                <div className="progress-container">
                    <label>{translations[currentLang].progressLabel} {progress}%</label>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chat-interface">
            <div className="messages-container">
                {messages.map(renderMessage)}
                {isTyping && (
                    <div className="typing-indicator">
                        {translations[currentLang].typingIndicator}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {renderProgressBar()}

            <form onSubmit={handleSendMessage} className="input-container">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={translations[currentLang].inputPlaceholder}
                    className="chat-input"
                    dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                />
                <button 
                    type="submit" 
                    disabled={!inputText.trim()} 
                    className="send-button"
                >
                    {translations[currentLang].sendButton}
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;