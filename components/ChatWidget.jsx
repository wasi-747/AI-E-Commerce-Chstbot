'use client';

import { useChat } from '@ai-sdk/react';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import AuthModal from '@/components/AuthModal';
import {
  Send, Loader2, ShoppingBag,
  Trash2, Bot, AlertCircle, CheckCircle2, Sparkles, LogIn,
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
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="180px" />
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
      <div className="p-2.5">
        <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-0.5">{product.brand}</p>
        <p className="text-[11px] font-medium text-slate-900 leading-tight line-clamp-1">{product.name}</p>
        <p className="text-[11px] font-semibold text-slate-900 mt-1">৳{product.price?.toLocaleString('en-BD')}</p>

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
                  className={`w-6 h-6 text-[8px] border transition-colors ${
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
          className={`w-full mt-2 py-1.5 text-[8px] uppercase tracking-widest transition-colors ${
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
      <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <span className="text-[9px] uppercase tracking-widest font-semibold text-slate-700">Your Bag</span>
        <span className="text-[9px] text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map((item, i) => (
          <li key={i} className="flex justify-between items-center px-3 py-2">
            <div>
              <p className="text-[11px] font-medium text-slate-900">{item.name}</p>
              <p className="text-[9px] text-slate-400">Size: {item.size} · Qty: {item.quantity}</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-900">৳{item.lineTotal?.toLocaleString('en-BD')}</span>
          </li>
        ))}
      </ul>
      <div className="px-3 py-2.5 border-t border-slate-200 flex justify-between items-center">
        <span className="text-[11px] font-semibold text-slate-900">Total</span>
        <span className="text-sm font-bold text-slate-900">৳{total?.toLocaleString('en-BD')}</span>
      </div>
      <button
        onClick={onOpenDrawer}
        className="w-full py-2 text-[9px] uppercase tracking-widest bg-black text-white hover:bg-slate-800 transition-colors"
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
      <div className="px-3 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
        <CheckCircle2 size={13} className="text-emerald-600" />
        <span className="text-[9px] uppercase tracking-widest font-semibold text-emerald-700">Order Confirmed</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[9px] text-slate-500 mb-0.5">Order Number</p>
        <p className="text-sm font-bold text-slate-900 font-mono">{orderNumber}</p>
      </div>
      <ul className="border-t border-slate-100 divide-y divide-slate-50">
        {items?.map((item, i) => (
          <li key={i} className="flex justify-between px-3 py-1.5">
            <span className="text-[10px] text-slate-700">{item.name} · {item.size} ×{item.quantity}</span>
            <span className="text-[10px] font-medium text-slate-900">৳{item.lineTotal?.toLocaleString('en-BD')}</span>
          </li>
        ))}
      </ul>
      <div className="px-3 py-2.5 border-t border-slate-200 space-y-1">
        <div className="flex justify-between text-[9px] text-slate-500">
          <span>Subtotal</span><span>৳{subtotal?.toLocaleString('en-BD')}</span>
        </div>
        <div className="flex justify-between text-[9px] text-slate-500">
          <span>Shipping</span><span>৳{shipping?.toLocaleString('en-BD')}</span>
        </div>
        <div className="flex justify-between text-[11px] font-bold text-slate-900 pt-1 border-t border-slate-100">
          <span>Total</span><span>৳{total?.toLocaleString('en-BD')}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ChatWidget — Left Sidebar ──────────────────────────────────────────
export default function ChatWidget() {
  const { data: session, status } = useSession();
  const { addToCart: addCartItem, openDrawer, fetchCart } = useCart();
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [clearing, setClearing]           = useState(false);
  const [chatInput, setChatInput]         = useState('');
  const [greetingSent, setGreetingSent]   = useState(false);
  const [authOpen, setAuthOpen]           = useState(false);
  const messagesEndRef                    = useRef(null);

  const { messages, sendMessage, status: chatStatus, setMessages } = useChat({
    api: '/api/chat',
    onError: (err) => console.error('Chat error:', err),
  });

  const isLoading = chatStatus === 'submitted' || chatStatus === 'streaming';

  // — Proactive greeting on mount ───────────────────────────────────────────
  useEffect(() => {
    if (status === 'loading') return;
    if (greetingSent) return;
    if (historyLoaded) return; // don't greet if history was already loaded

    const name = session?.user?.name?.split(' ')[0];
    const greeting = name
      ? `Hi ${name}! Welcome back to TechDojo Store. 👋`
      : `Welcome to TechDojo Store! 👋`;
    const intro = `I'm your AI stylist. I can help you find clothes, manage your cart, and place orders — all through chat. What are you looking for today?`;

    setMessages([
      {
        id: 'greeting-1',
        role: 'assistant',
        content: `${greeting}\n\n${intro}`,
        parts: [{ type: 'text', text: `${greeting}\n\n${intro}` }],
      },
    ]);
    setGreetingSent(true);
  }, [status, session, greetingSent, historyLoaded, setMessages]);

  // — Load chat history (once, after session is known) ──────────────────────
  useEffect(() => {
    if (session?.user && !historyLoaded) {
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
            setGreetingSent(true); // suppress greeting since we have history
          }
        })
        .catch(() => {})
        .finally(() => setHistoryLoaded(true));
    }
  }, [session, historyLoaded, setMessages]);

  // — Auto-scroll on new messages ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // — Refresh cart after AI responds ────────────────────────────────────────
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
      setGreetingSent(false); // re-trigger greeting
    } catch {/* silent */} finally {
      setClearing(false);
    }
  };

  // — Suggestion chip click ─────────────────────────────────────────────────
  const handleSuggestion = (text) => {
    if (!session?.user) {
      setAuthOpen(true);
      return;
    }
    setChatInput(text);
  };

  // ─── Render a single message ──────────────────────────────────────────────
  const renderMessage = (message) => {
    const isUser = message.role === 'user';

    let textContent = '';
    if (typeof message.content === 'string') textContent = message.content;
    else if (Array.isArray(message.parts)) {
      textContent = message.parts.filter((p) => p.type === 'text').map((p) => p.text).join('');
    }

    const toolParts = Array.isArray(message.parts)
      ? message.parts.filter((p) => p.type === 'dynamic-tool' || p.type.startsWith('tool-'))
      : [];

    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
        {!isUser && (
          <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-1.5 flex-shrink-0 mt-0.5">
            <Bot size={10} className="text-white" />
          </div>
        )}

        <div className={`max-w-[88%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
          {/* Text bubble */}
          {textContent && (
            <div className={`px-3 py-2 rounded-sm text-[12px] leading-relaxed whitespace-pre-line ${
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
                  <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-1.5">
                    {result.products.length} result{result.products.length !== 1 ? 's' : ''} found
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
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

            // Out of stock must be checked before the success+cart block
            if (toolName === 'addToCart' && !result.success && result.reason === 'out_of_stock') {
              return (
                <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2">
                  <AlertCircle size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-amber-800 leading-snug">
                    <strong>Out of stock</strong> — A restock request was submitted on your behalf.
                  </p>
                </div>
              );
            }

            // Show updated cart card after addToCart or removeFromCart (including empty state)
            if ((toolName === 'addToCart' || toolName === 'removeFromCart') && result.success && result.cart) {
              return (
                <div key={i} className="w-full">
                  <ChatCartCard
                    items={result.cart.items}
                    total={result.cart.total}
                    onOpenDrawer={openDrawer}
                  />
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    );
  };

  // ─── Suggestion chips ─────────────────────────────────────────────────────
  const SUGGESTIONS = [
    'Show me Nike running tees',
    "What's in my cart?",
    'Show me black dresses',
    "I'm ready to checkout",
  ];

  // ─── Auth gate panel ──────────────────────────────────────────────────────
  const renderAuthGate = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-5 text-center gap-4">
      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center">
        <Sparkles size={18} className="text-slate-400" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-900 mb-1">Meet Your AI Stylist</p>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Sign in to browse products, manage your cart, and place orders through AI-powered conversation.
        </p>
      </div>
      <button
        onClick={() => setAuthOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors"
      >
        <LogIn size={12} />
        Sign In to Chat
      </button>

      {/* Suggestion chips visible even when logged out */}
      <div className="w-full mt-2 space-y-1.5">
        <p className="text-[8px] uppercase tracking-widest text-slate-300 text-center">You can ask me</p>
        {SUGGESTIONS.map((s) => (
          <div
            key={s}
            className="w-full text-left px-3 py-2 text-[10px] text-slate-400 border border-slate-100 bg-slate-50 rounded-sm"
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Sidebar render ───────────────────────────────────────────────────────
  return (
    <aside
      id="ai-stylist-sidebar"
      className="fixed left-0 top-0 h-screen w-80 bg-white border-r border-slate-200 flex flex-col z-40 shadow-sm"
      aria-label="AI Stylist Sidebar"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-4 bg-black border-b border-black flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center ring-1 ring-white/20">
            <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white tracking-wide">AI Stylist</p>
            <p className="text-[8px] text-white/50 uppercase tracking-widest">TechDojo Store</p>
          </div>
        </div>
        {/* Online indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] text-white/40 uppercase tracking-widest">Online</span>
          {session?.user && messages.length > 0 && (
            <button
              onClick={handleClearChat}
              disabled={clearing}
              title="Clear chat history"
              className="ml-2 p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
              aria-label="Clear chat"
            >
              {clearing ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 scroll-smooth">
        {status === 'loading' ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={18} className="animate-spin text-slate-300" />
          </div>
        ) : !session?.user ? (
          renderAuthGate()
        ) : (
          <>
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={10} className="text-white" />
                </div>
                <div className="bg-slate-100 px-3 py-2 rounded-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Suggestion Chips (only when logged in and no chat yet) ── */}
      {session?.user && messages.length <= 1 && !isLoading && (
        <div className="px-3 pb-2 flex-shrink-0">
          <p className="text-[8px] uppercase tracking-widest text-slate-300 text-center mb-1.5">Try asking</p>
          <div className="grid grid-cols-2 gap-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="text-left px-2 py-1.5 text-[9px] text-slate-600 border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-colors rounded-sm leading-tight"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ── */}
      {session?.user && (
        <form
          onSubmit={handleSend}
          className="border-t border-slate-200 px-3 py-3 flex items-center gap-2 flex-shrink-0"
        >
          <input
            id="chat-input"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask your stylist…"
            disabled={isLoading}
            aria-label="Chat message input"
            className="flex-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !chatInput.trim()}
            aria-label="Send message"
            className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading
              ? <Loader2 size={11} className="animate-spin" />
              : <Send size={11} strokeWidth={2} />
            }
          </button>
        </form>
      )}
      {/* ── AuthModal ── */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </aside>
  );
}
