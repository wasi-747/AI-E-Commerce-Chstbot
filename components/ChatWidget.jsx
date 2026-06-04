'use client';

import { useChat } from '@ai-sdk/react';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import {
  MessageCircle, X, Send, Loader2, ShoppingBag,
  Trash2, Bot, ChevronDown, AlertCircle, CheckCircle2,
} from 'lucide-react';

// ─── Product Card rendered inside chat ───────────────────────────────────────
function ChatProductCard({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [adding, setAdding]             = useState(false);
  const [added, setAdded]               = useState(false);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const inStock = sizes.filter((s) => (product.inventory?.[s] ?? 0) > 0);
  const isOutOfStock = inStock.length === 0;

  const handleAdd = async () => {
    setAdding(true);
    await onAddToCart(product.id, selectedSize, product.name);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-slate-100">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="220px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={20} className="text-slate-300" />
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 border border-slate-300 px-2 py-1 bg-white">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-0.5">{product.brand}</p>
        <p className="text-xs font-medium text-slate-900 leading-tight line-clamp-1">{product.name}</p>
        <p className="text-xs font-semibold text-slate-900 mt-1">৳{product.price?.toLocaleString('en-BD')}</p>

        {/* Size selector */}
        {!isOutOfStock && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {sizes.map((s) => {
              const available = (product.inventory?.[s] ?? 0) > 0;
              return (
                <button
                  key={s}
                  onClick={() => available && setSelectedSize(s)}
                  disabled={!available}
                  className={`w-7 h-7 text-[9px] border transition-colors ${
                    selectedSize === s
                      ? 'bg-black text-white border-black'
                      : available
                        ? 'bg-white text-slate-700 border-slate-300 hover:border-black'
                        : 'bg-white text-slate-200 border-slate-100 cursor-not-allowed line-through'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={adding || isOutOfStock || added}
          className={`w-full mt-2 py-2 text-[9px] uppercase tracking-widest transition-colors ${
            added
              ? 'bg-slate-700 text-white'
              : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-slate-800'
          }`}
        >
          {adding ? 'Adding…' : added ? '✓ Added' : isOutOfStock ? 'Sold Out' : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
}

// ─── Cart Summary Card ────────────────────────────────────────────────────────
function ChatCartCard({ items, total, onOpenDrawer }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 text-center">
        <ShoppingBag size={18} className="text-slate-300 mx-auto mb-1" />
        <p className="text-xs text-slate-500">Your cart is empty.</p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-700">Your Bag</span>
        <span className="text-[10px] text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map((item, i) => (
          <li key={i} className="flex justify-between items-center px-4 py-2.5">
            <div>
              <p className="text-xs font-medium text-slate-900">{item.name}</p>
              <p className="text-[10px] text-slate-400">Size: {item.size} · Qty: {item.quantity}</p>
            </div>
            <span className="text-xs font-semibold text-slate-900">৳{item.lineTotal?.toLocaleString('en-BD')}</span>
          </li>
        ))}
      </ul>
      <div className="px-4 py-3 border-t border-slate-200 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-900">Total</span>
        <span className="text-sm font-bold text-slate-900">৳{total?.toLocaleString('en-BD')}</span>
      </div>
      <button
        onClick={onOpenDrawer}
        className="w-full py-2.5 text-[10px] uppercase tracking-widest bg-black text-white hover:bg-slate-800 transition-colors"
      >
        Open Bag
      </button>
    </div>
  );
}

// ─── Order Confirmation Card ──────────────────────────────────────────────────
function ChatOrderCard({ orderNumber, items, subtotal, shipping, total }) {
  return (
    <div className="bg-white border border-emerald-200 rounded-sm overflow-hidden">
      <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
        <CheckCircle2 size={14} className="text-emerald-600" />
        <span className="text-[10px] uppercase tracking-widest font-semibold text-emerald-700">Order Confirmed</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-[10px] text-slate-500 mb-0.5">Order Number</p>
        <p className="text-sm font-bold text-slate-900 font-mono">{orderNumber}</p>
      </div>
      <ul className="border-t border-slate-100 divide-y divide-slate-50">
        {items?.map((item, i) => (
          <li key={i} className="flex justify-between px-4 py-2">
            <span className="text-xs text-slate-700">{item.name} · {item.size} ×{item.quantity}</span>
            <span className="text-xs font-medium text-slate-900">৳{item.lineTotal?.toLocaleString('en-BD')}</span>
          </li>
        ))}
      </ul>
      <div className="px-4 py-3 border-t border-slate-200 space-y-1">
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>Subtotal</span><span>৳{subtotal?.toLocaleString('en-BD')}</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>Shipping</span><span>৳{shipping?.toLocaleString('en-BD')}</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-slate-900 pt-1 border-t border-slate-100">
          <span>Total</span><span>৳{total?.toLocaleString('en-BD')}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ChatWidget ──────────────────────────────────────────────────────────
export default function ChatWidget() {
  const { data: session, status } = useSession();
  const { addToCart: addCartItem, openDrawer, fetchCart } = useCart();
  const [isOpen, setIsOpen]               = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [clearing, setClearing]           = useState(false);
  const [chatInput, setChatInput]         = useState('');
  const messagesEndRef                    = useRef(null);

  const { messages, sendMessage, status: chatStatus, setMessages } = useChat({
    api: '/api/chat',
    onError: (err) => console.error('Chat error:', err),
  });

  const isLoading = chatStatus === 'submitted' || chatStatus === 'streaming';

  // — Load chat history on open (once per session) ──────────────────────────
  useEffect(() => {
    if (isOpen && session?.user && !historyLoaded) {
      fetch('/api/chat/history')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data?.length > 0) {
            const historical = data.data.map((msg, i) => ({
              id:      `hist-${i}`,
              role:    msg.role,
              content: msg.content,
              parts:   [{ type: 'text', text: msg.content }],
            }));
            setMessages(historical);
          }
        })
        .catch(() => {}) // silent fail
        .finally(() => setHistoryLoaded(true));
    }
  }, [isOpen, session, historyLoaded, setMessages]);

  // — Auto-scroll on new messages ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant') fetchCart();
  }, [messages, fetchCart, isLoading]);

  // — Handle send ───────────────────────────────────────────────────────────
  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setChatInput('');
  };

  // — Handle add-to-cart from product card ──────────────────────────────────
  const handleChatAddToCart = async (productId, size) => {
    await addCartItem(productId, size, 1);
  };

  // — Clear chat ────────────────────────────────────────────────────────────
  const handleClearChat = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await fetch('/api/chat/history', { method: 'DELETE' });
      setMessages([]);
      setHistoryLoaded(true);
    } catch {/* silent */} finally {
      setClearing(false);
    }
  };

  // — Suggestion chip click ─────────────────────────────────────────────────
  const handleSuggestion = (text) => {
    setChatInput(text);
  };

  // ─── Render a single message ──────────────────────────────────────────────
  const renderMessage = (message) => {
    const isUser = message.role === 'user';

    // Extract text content
    let textContent = '';
    if (typeof message.content === 'string') textContent = message.content;
    else if (Array.isArray(message.parts)) {
      textContent = message.parts.filter((p) => p.type === 'text').map((p) => p.text).join('');
    }

    // Extract tool invocations/results
    const toolParts = Array.isArray(message.parts)
      ? message.parts.filter((p) => p.type === 'dynamic-tool' || p.type.startsWith('tool-'))
      : [];

    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isUser && (
          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
            <Bot size={12} className="text-white" />
          </div>
        )}

        <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
          {/* Text bubble */}
          {textContent && (
            <div className={`px-4 py-2.5 rounded-sm text-sm leading-relaxed ${
              isUser
                ? 'bg-black text-white'
                : 'bg-slate-100 text-slate-900'
            }`}>
              {textContent}
            </div>
          )}

          {/* Tool result UI cards */}
          {toolParts.map((part, i) => {
            const toolName = part.type === 'dynamic-tool' ? part.toolName : part.type.slice(5);
            const state = part.state;
            const result = part.output;
            if (state !== 'output-available' || !result) return null;

            if ((toolName === 'browseProducts' || toolName === 'showProducts') && result.found && result.products?.length > 0) {
              return (
                <div key={i} className="w-full">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-2">
                    {result.products.length} result{result.products.length !== 1 ? 's' : ''} found
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {result.products.map((p) => (
                      <ChatProductCard
                        key={p.id}
                        product={p}
                        onAddToCart={handleChatAddToCart}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            if (toolName === 'viewCart') {
              return (
                <div key={i} className="w-full">
                  <ChatCartCard
                    items={result.items}
                    total={result.total}
                    onOpenDrawer={openDrawer}
                  />
                </div>
              );
            }

            if (toolName === 'checkout' && result.success) {
              return (
                <div key={i} className="w-full">
                  <ChatOrderCard
                    orderNumber={result.orderNumber}
                    items={result.items}
                    subtotal={result.subtotal}
                    shipping={result.shipping}
                    total={result.total}
                  />
                </div>
              );
            }

            if (toolName === 'addToCart' && !result.success && result.reason === 'out_of_stock') {
              return (
                <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2">
                  <AlertCircle size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-amber-800 leading-snug">
                    <strong>Out of stock</strong> — A restock request was submitted on your behalf.
                  </p>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    );
  };

  // ─── Auth gate ────────────────────────────────────────────────────────────
  const renderAuthGate = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center">
        <Bot size={20} className="text-slate-400" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-900 mb-1">Sign in to chat</p>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Create an account or sign in to browse products, manage your cart, and place orders through AI.
        </p>
      </div>
    </div>
  );

  // ─── Suggested prompts ────────────────────────────────────────────────────
  const SUGGESTIONS = [
    'Show me Nike running tees',
    'Add Nike Dri-FIT tee in size M',
    "What's in my cart?",
    "I'm ready to place my order",
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        id="chat-widget-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
        className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-xl hover:bg-slate-800 active:bg-slate-700 transition-colors z-50"
      >
        {isOpen
          ? <X size={20} strokeWidth={1.5} />
          : <MessageCircle size={20} strokeWidth={1.5} />
        }
        {/* Unread dot when closed and has messages */}
        {!isOpen && messages.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 w-[360px] sm:w-[400px] bg-white border border-slate-200 rounded-sm shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{ height: '580px' }}
        role="dialog"
        aria-label="ShopBot AI assistant"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white tracking-wide">ShopBot</p>
              <p className="text-[9px] text-white/60 uppercase tracking-widest">TechDojo Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session?.user && messages.length > 0 && (
              <button
                onClick={handleClearChat}
                disabled={clearing}
                title="Clear chat history"
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
                aria-label="Clear chat"
              >
                {clearing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
              aria-label="Close chat"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {status === 'loading' ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={20} className="animate-spin text-slate-300" />
            </div>
          ) : !session?.user ? (
            renderAuthGate()
          ) : messages.length === 0 ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mb-3">
                  <Bot size={18} className="text-slate-500" />
                </div>
                <p className="text-xs font-medium text-slate-900 mb-1">
                  Hi {session.user.name?.split(' ')[0] || 'there'}! 👋
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  I can help you browse products, manage your cart, and place orders — all through chat.
                </p>
              </div>

              {/* Suggestion chips */}
              <div className="space-y-2 pb-1">
                <p className="text-[9px] uppercase tracking-widest text-slate-400 text-center">Try asking</p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="w-full text-left px-3 py-2 text-[11px] text-slate-700 border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-colors rounded-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map(renderMessage)}
              {isLoading && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="bg-slate-100 px-4 py-2.5 rounded-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        {session?.user && (
          <form
            onSubmit={handleSend}
            className="border-t border-slate-200 px-4 py-3 flex items-center gap-3"
          >
            <input
              id="chat-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask ShopBot anything…"
              disabled={isLoading}
              aria-label="Chat message input"
              className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              aria-label="Send message"
              className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading
                ? <Loader2 size={13} className="animate-spin" />
                : <Send size={13} strokeWidth={2} />
              }
            </button>
          </form>
        )}
      </div>
    </>
  );
}
