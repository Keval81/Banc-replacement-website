'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, User, Loader2, Home, Calendar, Tag } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  properties?: any[];
  action?: string;
  timestamp: Date;
}

export default function PropertyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Banc, your AI property assistant. I can help you find properties, arrange viewings, or get a valuation. What are you looking for?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure mobile keyboard opens properly
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Prevent body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Handle keyboard resize on mobile
  useEffect(() => {
    const handleResize = () => {
      if (isOpen && chatContainerRef.current) {
        // Scroll to bottom when keyboard opens/closes
        setTimeout(() => {
          scrollToBottom();
        }, 300);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm sorry, I didn't understand that. Could you rephrase?",
        properties: data.properties,
        action: data.action,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again or call us at 01707 640 777.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickReplies = [
    "Find me a 3-bed house in Cuffley",
    "What's my property worth?",
    "Book a viewing",
    "First-time buyer advice",
  ];

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-36 right-4 sm:bottom-6 sm:right-6 z-40 w-14 h-14 min-w-[56px] min-h-[56px] bg-[#1a4d5c] text-white rounded-full shadow-lg hover:bg-[#1a4d5c]/90 transition-all flex items-center justify-center group touch-manipulation"
            aria-label="Open chat"
            style={{ touchAction: 'manipulation' }}
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 z-50 sm:w-[400px] md:w-[420px]"
            ref={chatContainerRef}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border max-h-[80dvh] sm:max-h-[600px] flex flex-col">
              {/* Header */}
              <div className="bg-[#1a4d5c] text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 min-w-[40px] min-h-[40px] bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base">Banc Assistant</h3>
                    <p className="text-xs text-white/70 truncate">AI-powered property help</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors touch-manipulation"
                  aria-label="Close chat"
                  style={{ touchAction: 'manipulation' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-banc-grey-pale overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 ${
                        message.role === 'user'
                          ? 'bg-[#1a4d5c] text-white rounded-br-md'
                          : 'bg-white shadow-sm border rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>

                      {/* Property Cards */}
                      {message.properties && message.properties.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.properties.map((property) => (
                            <a
                              key={property.id}
                              href={`/sales/properties/${property.id}`}
                              className="block bg-banc-grey-pale rounded-lg p-3 hover:bg-banc-grey/20 transition-colors touch-manipulation"
                              style={{ touchAction: 'manipulation' }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-16 h-12 bg-banc-grey/30 rounded overflow-hidden shrink-0">
                                  {property.images?.[0] && (
                                    <img
                                      src={property.images[0]}
                                      alt={property.title}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate text-banc-dark">
                                    {property.title}
                                  </p>
                                  <p className="text-xs text-banc-grey">
                                    {property.bedrooms} bed • £{property.price.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-banc-grey truncate">
                                    {property.location}
                                  </p>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {message.action === 'valuation' && (
                        <div className="mt-3">
                          <a href="/tools/valuation">
                            <Button size="sm" className="w-full bg-white text-[#1a4d5c] hover:bg-banc-grey-pale h-11 min-h-[44px] text-sm">
                              <Tag className="w-4 h-4 mr-2" />
                              Get Free Valuation
                            </Button>
                          </a>
                        </div>
                      )}

                      {message.action === 'viewing' && (
                        <div className="mt-3">
                          <a href="/contact">
                            <Button size="sm" className="w-full bg-white text-[#1a4d5c] hover:bg-banc-grey-pale h-11 min-h-[44px] text-sm">
                              <Calendar className="w-4 h-4 mr-2" />
                              Contact Us
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-sm border rounded-2xl rounded-bl-md p-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#1a4d5c]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {messages.length < 3 && (
                <div className="px-3 sm:px-4 py-2 bg-banc-grey-pale border-t shrink-0">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => {
                          setInput(reply);
                          inputRef.current?.focus();
                        }}
                        className="text-xs bg-white border rounded-full px-3 py-2.5 min-h-[44px] text-banc-grey hover:bg-banc-grey-pale hover:text-banc-dark transition-colors touch-manipulation"
                        style={{ touchAction: 'manipulation' }}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 sm:p-4 bg-white border-t shrink-0">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 h-11 min-h-[44px] text-base"
                    style={{ fontSize: '16px' }} // Prevents iOS zoom on focus
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-[#1a4d5c] hover:bg-[#1a4d5c]/90 h-11 w-11 min-w-[44px] min-h-[44px] p-0 flex items-center justify-center touch-manipulation"
                    style={{ touchAction: 'manipulation' }}
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-banc-grey mt-2 text-center">
                  Powered by AI • May occasionally produce inaccurate information
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
