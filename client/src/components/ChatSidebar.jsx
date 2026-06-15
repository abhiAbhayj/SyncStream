import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Hash, MessageSquare, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function ChatSidebar({ roomCode }) {
  const { user } = useAuth();
  const socket = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  // 1. Fetch chat history from DB on load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`/api/rooms/${roomCode}/messages`);
        setMessages(res.data || []);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    if (roomCode) {
      fetchHistory();
    }
  }, [roomCode]);

  // 2. Listen for Socket chat broadcasts
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket]);

  // 3. Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Send message handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    socket.emit('send_message', {
      roomCode,
      messageText: newMessage.trim(),
      userId: user.id
    });

    setNewMessage('');
  };

  // 5. Mention user helper
  const handleMention = (username) => {
    setNewMessage(prev => {
      const mentionStr = `@${username} `;
      if (prev.includes(mentionStr)) return prev;
      return prev + mentionStr;
    });
  };

  // Format message time
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-darkCard border border-darkBorder rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-darkBorder flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accentCyan" />
          <span className="font-bold text-sm text-gray-200">Party Chat</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 font-bold bg-darkBg px-2.5 py-1 rounded-lg border border-darkBorder">
          <Hash className="w-3.5 h-3.5 text-accentPurple" />
          {roomCode}
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 max-h-[450px] md:max-h-[none]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
            <MessageSquare className="w-8 h-8 opacity-20 mb-2" />
            <p className="text-xs">No messages yet in this lobby.</p>
            <p className="text-[10px] text-gray-600">Break the ice and start typing!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === user?.id;
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 items-start animate-fade-in group`}
              >
                <img
                  src={msg.avatar_url}
                  alt={msg.username}
                  className="w-8 h-8 rounded-full bg-darkBg border border-darkBorder object-cover cursor-pointer hover:border-accentCyan transition"
                  onClick={() => handleMention(msg.username)}
                  title={`Mention ${msg.username}`}
                />
                <div className="flex-grow space-y-1 overflow-hidden">
                  <div className="flex items-baseline justify-between">
                    <span 
                      onClick={() => handleMention(msg.username)}
                      className={`text-xs font-bold cursor-pointer hover:underline ${
                        isMe ? 'text-accentCyan' : 'text-gray-300'
                      }`}
                    >
                      {msg.username}
                    </span>
                    <span className="text-[10px] text-gray-600 font-semibold">
                      {formatTime(msg.sent_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed break-words font-medium">
                    {/* Basic parsing to highlight user mentions */}
                    {msg.message_text.split(' ').map((word, wIdx) => {
                      if (word.startsWith('@') && word.length > 1) {
                        return <span key={wIdx} className="text-accentPurple font-bold mr-1">{word}</span>;
                      }
                      return word + ' ';
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input box */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-darkBorder bg-black/25 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message party members..."
          className="flex-grow bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition placeholder:text-gray-600"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-accentCyan text-black p-2.5 rounded-xl hover:bg-accentCyan/80 disabled:opacity-40 transition shadow-lg disabled:cursor-not-allowed hover:shadow-accentCyan/10"
        >
          <Send className="w-4 h-4 fill-current" />
        </button>
      </form>
    </div>
  );
}
