import React, { useState, useEffect, useRef } from 'react';
import Icon from './shared/Icon';

// Komponen kecil untuk daftar percakapan
const ConversationList = ({ conversations, activeConversationId, onSelectConversation }) => {
    return (
        <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-800/50 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-white">Percakapan</h2>
            </div>
            <div className="overflow-y-auto flex-grow">
                {conversations.map(convo => (
                    <div
                        key={convo.id}
                        onClick={() => onSelectConversation(convo.id)}
                        className={`p-4 flex items-center cursor-pointer border-l-4 ${activeConversationId === convo.id ? 'bg-green-500/10 border-green-500' : 'border-transparent hover:bg-gray-700/50'}`}
                    >
                        <img src={convo.profilePic} alt={convo.customerName} className="w-12 h-12 rounded-full mr-4" />
                        <div className="flex-grow overflow-hidden">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-white truncate">{convo.customerName}</h3>
                                <span className="text-xs text-gray-400 flex-shrink-0">{convo.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-400 truncate">{convo.lastMessage}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Komponen kecil untuk jendela obrolan
const ChatWindow = ({ conversation, messages, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(conversation.id, newMessage);
            setNewMessage('');
        }
    };

    if (!conversation) {
        return (
            <div className="flex-grow flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <Icon name="message-square" className="w-16 h-16 mx-auto mb-4" />
                    <p>Pilih percakapan untuk memulai</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow flex flex-col bg-gray-800">
            {/* Header Chat */}
            <div className="p-4 border-b border-gray-700 flex items-center flex-shrink-0">
                <img src={conversation.profilePic} alt={conversation.customerName} className="w-10 h-10 rounded-full mr-4" />
                <div>
                    <h3 className="font-bold text-white">{conversation.customerName}</h3>
                    <p className="text-sm text-gray-400">{conversation.customerNumber}</p>
                </div>
            </div>

            {/* Area Pesan */}
            <div className="flex-grow p-6 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'customer' && <img src={conversation.profilePic} className="w-8 h-8 rounded-full" alt="cust"/>}
                            <div className={`max-w-lg p-3 rounded-2xl ${msg.sender === 'agent' ? 'bg-green-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                <p>{msg.text}</p>
                                <span className="text-xs opacity-70 mt-1 block text-right">{msg.timestamp}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Chat */}
            <div className="p-4 bg-gray-900/50 flex-shrink-0">
                <div className="flex items-center bg-gray-700 rounded-lg px-2">
                    <button className="p-2 text-gray-400 hover:text-green-400"><Icon name="smile" className="w-6 h-6" /></button>
                    <button className="p-2 text-gray-400 hover:text-green-400"><Icon name="paperclip" className="w-6 h-6" /></button>
                    <input
                        type="text"
                        placeholder="Ketik pesan..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="w-full bg-transparent p-3 text-white focus:outline-none"
                    />
                    <button onClick={handleSend} className="p-3 bg-green-500 text-white rounded-lg m-1 hover:bg-green-600 disabled:bg-gray-500" disabled={!newMessage.trim()}>
                        <Icon name="send" className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Komponen utama halaman
const CustomerServicePage = ({ conversations, messageHistories, onUpdateConversations, onUpdateMessageHistories }) => {
    const [activeConversationId, setActiveConversationId] = useState(null);

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const activeMessages = messageHistories[activeConversationId] || [];

    const handleSendMessage = (conversationId, messageText) => {
        const newMessage = {
            id: Date.now(),
            text: messageText,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            sender: 'agent'
        };

        // Update riwayat pesan
        const updatedHistory = {
            ...messageHistories,
            [conversationId]: [...(messageHistories[conversationId] || []), newMessage]
        };
        onUpdateMessageHistories(updatedHistory);

        // Update pesan terakhir di daftar percakapan
        const updatedConversations = conversations.map(convo => 
            convo.id === conversationId 
            ? { ...convo, lastMessage: messageText, timestamp: newMessage.timestamp } 
            : convo
        );
        onUpdateConversations(updatedConversations);
    };

    return (
        <div className="h-screen flex flex-col md:flex-row">
            <ConversationList
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={setActiveConversationId}
            />
            <ChatWindow
                conversation={activeConversation}
                messages={activeMessages}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
};

export default CustomerServicePage;