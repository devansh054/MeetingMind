import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Smile } from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'system';
}

interface ChatPanelProps {
  meetingId: string;
  currentUserId: string;
  currentUserName: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ meetingId, currentUserId, currentUserName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      userName: 'System',
      content: 'Meeting chat started. Welcome to the meeting!',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: currentUserId,
        userName: currentUserName,
        content: newMessage.trim(),
        timestamp: new Date(),
        type: 'message'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // TODO: Send message via WebSocket to other participants
      // websocketService.sendChatMessage(meetingId, message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-medium flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          Meeting Chat
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {messages.filter(m => m.type === 'message').length} messages
        </p>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.map((message) => (
          <div key={message.id} className={`group ${message.type === 'system' ? 'text-center' : ''}`}>
            {message.type === 'system' ? (
              <div className="text-xs text-gray-500 bg-gray-800 rounded-full px-3 py-1 inline-block">
                {message.content}
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.userId === currentUserId ? 'bg-primary-600' : 'bg-gray-600'
                  }`}>
                    <span className="text-xs font-medium text-white">
                      {message.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {message.userName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(message.timestamp, 'HH:mm')}
                    </span>
                  </div>
                  
                  <div className={`text-sm p-2 rounded-lg max-w-xs ${
                    message.userId === currentUserId 
                      ? 'bg-primary-600 text-white ml-auto' 
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {message.content}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex space-x-2">
            <button className="text-gray-400 hover:text-white p-1 rounded">
              <Smile className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
