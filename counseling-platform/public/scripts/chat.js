import { ChatService } from './chat-service.js';

let chatService;
let chatForm;
let messageInput;
let sendButton;
let chatMessages;

// Function to send message
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    try {
        // Add user message to chat
        addMessageToUI('user', message);
        
        // Clear input and reset height
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Get AI response
        const response = await chatService.sendMessage(message);
        
        // Remove typing indicator and show response
        removeTypingIndicator();
        if (response) {
            addMessageToUI('assistant', response);
        } else {
            addMessageToUI('assistant', 'Sorry, I couldn\'t generate a response. Please try again.');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showError('Failed to send message. Please try again.');
        addMessageToUI('assistant', 'Sorry, I encountered an error. Please try again.');
    }
}

// Add a message to the chat UI
function addMessageToUI(role, content) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content';
    
    const textElement = document.createElement('p');
    textElement.textContent = content;
    
    const timeElement = document.createElement('span');
    timeElement.className = 'message-time';
    timeElement.textContent = new Date().toLocaleTimeString();
    
    contentWrapper.appendChild(textElement);
    contentWrapper.appendChild(timeElement);
    messageElement.appendChild(contentWrapper);
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show the typing indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message assistant typing-indicator';
    indicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove the typing indicator
function removeTypingIndicator() {
    const indicator = chatMessages.querySelector('.typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Initialize chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    chatForm = document.getElementById('chatForm');
    messageInput = document.getElementById('messageInput');
    sendButton = document.getElementById('sendMessage');
    chatMessages = document.getElementById('chatMessages');
    chatService = new ChatService();

    // Add welcome message
    addMessageToUI('assistant', 'Hello! I\'m your AI counseling assistant. How can I help you today?');

    // Handle send button click
    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        sendMessage().catch(console.error);
    });

    // Handle Enter key
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage().catch(console.error);
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    });
});
