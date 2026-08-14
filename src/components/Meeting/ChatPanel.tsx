import React, { useState } from 'react';
import { useMeetingStore } from '@/store/useMeetingStore';
import { ChevronDown, Send, File, Smile } from 'lucide-react';

export default function ChatPanel() {
  const { rightPanel, setRightPanel } = useMeetingStore();
  const messageIdRef = React.useRef(3);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Namith Raj (Host)', time: '10:02 AM', text: 'Welcome to the meeting everyone!', isMe: false },
    { id: 2, sender: 'Sarah', time: '10:04 AM', text: 'Hi! Thanks for having me.', isMe: false },
    { id: 3, sender: 'Me', time: '10:05 AM', text: 'Can everyone see my screen?', isMe: true },
  ]);
  const [inputValue, setInputValue] = useState('');

  if (rightPanel !== 'chat') return null;

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageIdRef.current += 1;

    setMessages([...messages, {
      id: messageIdRef.current,
      sender: 'Me',
      time,
      text: inputValue,
      isMe: true
    }]);
    
    setInputValue('');
  };

  return (
    <div className="w-[320px] bg-[#242424] border-l border-gray-800 flex flex-col h-full flex-shrink-0 z-30 shadow-xl">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-gray-800 flex-shrink-0">
        <span className="text-gray-200 font-medium text-sm">Meeting Chat</span>
        <ChevronDown 
          className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer" 
          onClick={() => setRightPanel(null)}
        />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
        {messages.map(msg => (
          <div key={msg.id} className="flex flex-col">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xs font-medium text-blue-400">{msg.sender}</span>
              <span className="text-[10px] text-gray-500">{msg.time}</span>
            </div>
            <p className="text-sm text-gray-200 bg-gray-800/50 p-2 rounded-lg w-fit max-w-[90%]">
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-3 bg-[#242424]">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs text-gray-400">To: <strong className="text-blue-400 cursor-pointer hover:underline">Everyone</strong> </span>
        </div>
        
        <form onSubmit={handleSend} className="bg-white rounded-lg overflow-hidden flex flex-col">
          <textarea 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type message here..."
            className="w-full bg-white text-gray-900 text-sm p-2 resize-none h-20 focus:outline-none"
          />
          <div className="flex justify-between items-center bg-gray-50 p-1.5 border-t border-gray-200">
            <div className="flex gap-1">
              <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-200 rounded">
                <File className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-200 rounded">
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
