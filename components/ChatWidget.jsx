'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    api: '/api/chat',
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-900 transition z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white border border-black rounded-sm shadow-2xl flex flex-col z-50">
          <div className="border-b border-black px-6 py-4 flex justify-between items-center">
            <h2 className="text-xs font-light uppercase tracking-widest">Style Advisor</h2>
            <button onClick={() => setIsOpen(false)} className="text-black hover:text-gray-600">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-4">How may we assist you today?</div>
            ) : (
              messages.map((m) => {
                const textContent = m.parts
                  ? m.parts.filter(p => p.type === 'text').map(p => p.text).join('')
                  : m.content;

                return (
                  <div key={m.id} className={`text-sm ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <p className={`inline-block ${m.role === 'user' ? 'text-gray-500' : 'text-black'} whitespace-pre-wrap`}>
                      {textContent}
                    </p>
                  </div>
                );
              })
            )}
            {isLoading && <div className="text-xs text-gray-400">Typing...</div>}
          </div>

          <form onSubmit={handleFormSubmit} className="border-t border-black px-6 py-4 flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="MESSAGE..."
              className="flex-1 text-xs uppercase tracking-widest border-b border-black focus:outline-none bg-transparent"
            />
            <button type="submit" disabled={isLoading} className="text-xs uppercase tracking-widest font-light text-black hover:text-gray-600 disabled:opacity-50">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
