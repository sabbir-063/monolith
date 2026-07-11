import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { trackEvent, trackChatMessage } from '../lib/tracker';
import './ChatWidget.css';

// SVG Icons
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

// Secure, lightweight markdown parsing helper for basic formatting (*bold*, _italic_, and `code`, plus bullets)
const formatMessage = (text) => {
  if (!text) return '';
  // Basic HTML escape for security
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Replace bold **text** with <strong>text</strong>
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace italic *text* or _text_ with <em>text</em>
  escaped = escaped.replace(/\*(?!\*)(.*?)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Replace inline code `code` with <code>code</code>
  escaped = escaped.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Parse bulleted lists
  const lines = escaped.split('\n');
  let inList = false;
  const formattedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const match = line.match(/^([\-*])\s+(.*)/);
    if (match) {
      if (!inList) {
        formattedLines.push('<ul class="chat-widget__list">');
        inList = true;
      }
      formattedLines.push(`<li>${match[2]}</li>`);
    } else {
      if (inList) {
        formattedLines.push('</ul>');
        inList = false;
      }
      formattedLines.push(line);
    }
  }
  if (inList) {
    formattedLines.push('</ul>');
  }
  
  return formattedLines
    .join('\n')
    .replace(/\n/g, '<br />')
    .replace(/<\/ul><br \/>/g, '</ul>')
    .replace(/<ul class="chat-widget__list"><br \/>/g, '<ul class="chat-widget__list">')
    .replace(/<\/li><br \/>/g, '</li>');
};

export default function ChatWidget() {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPulse, setHasPulse] = useState(true); // Glimmer pulse on the trigger button until first opened

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // Suggested starting chips based on language
  const chips = lang === 'en' 
    ? [
        'How do I order a MONOLITH?',
        'What are the finishes and prices?',
        'Can I engrave my brick?',
        'Why is it offline always?',
        'Who made this website?',
        'Can I play the stack game?',
      ]
    : [
        'মনোলিথ কিভাবে অর্ডার করব?',
        'ফিনিশ ও দামগুলো কী কী?',
        'আমি কি ইটে খোদাই করতে পারি?',
        'এটি কেন সব সময় অফলাইন?',
        'এই ওয়েবসাইট কে বানিয়েছে?',
        'আমি কি স্ট্যাকিং গেমটি খেলতে পারি?',
      ];

  const translations = {
    en: {
      title: 'Monolith AI',
      subtitle: 'v1.0 · AI Assistant',
      placeholder: 'Ask about MONOLITH...',
      chipsTitle: 'SUGGESTIONS',
      greeting: 'Greetings. I am Monolith AI. Ask me about the philosophy, craftsmanship, or specifications of the ultimate red brick.',
      error: 'Unable to connect to Monolith AI. Please try again.',
    },
    bn: {
      title: 'মনোলিথ এআই',
      subtitle: 'v১.০ · এআই সহকারী',
      placeholder: 'মনোলিথ সম্পর্কে জিজ্ঞাসা করুন...',
      chipsTitle: 'পরামর্শসমূহ',
      greeting: 'অভিনন্দন। আমি মনোলিথ এআই। আমাদের অনন্য লাল ইটের দর্শন, কারুকাজ বা স্পেসিফিকেশন সম্পর্কে যেকোনো প্রশ্ন করুন।',
      error: 'মনোলিথ এআই-এর সাথে সংযোগ করা যাচ্ছে না। দয়া করে আবার চেষ্টা করুন।',
    }
  };

  const t = translations[lang] || translations.en;

  // Initialize with a welcome greeting
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'ai',
        text: t.greeting,
        timestamp: new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, [lang]);

  // Keep scroll focused on latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input field when widget is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Cleanup abort controller and typing timer on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const handleCloseChat = () => {
    setIsOpen(false);
    trackEvent('chat_close', 'Chat Closed');
    
    // Abort active fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear active typewriter animation
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    
    // Reset messages state to just welcome message (new session starts)
    setMessages([
      {
        id: 'welcome',
        role: 'ai',
        text: t.greeting,
        timestamp: new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setIsLoading(false);
  };

  const handleOpenToggle = () => {
    const nextState = !isOpen;
    if (nextState) {
      setIsOpen(true);
      setHasPulse(false);
      trackEvent('chat_open', 'Chat Opened');
    } else {
      handleCloseChat();
    }
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || isLoading) return;

    // Abort any existing ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any active typing animation
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    trackChatMessage('user', textToSend);

    try {
      // Map existing messages to history format for Gemini API, skipping the welcome message
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-10) // Limit history to last 10 messages to keep context size clean
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: textToSend,
          history,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error');
      }

      const data = await res.json();
      const fullText = data.text || '';

      if (fullText.startsWith('[ERROR]:')) {
        throw new Error(fullText.replace('[ERROR]:', '').trim());
      }

      trackChatMessage('ai', fullText);

      const aiMessageId = `ai-${Date.now()}`;

      // Insert an empty AI message to stream content into
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          role: 'ai',
          text: '',
          timestamp: new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // Turn off loading once response is ready to type
      setIsLoading(false);

      if (fullText) {
        let currentIdx = 0;
        typingIntervalRef.current = setInterval(() => {
          currentIdx += 2; // Type 2 characters at a time for smooth reading pace
          if (currentIdx >= fullText.length) {
            currentIdx = fullText.length;
          }
          const currentSlice = fullText.slice(0, currentIdx);

          setMessages((prev) => 
            prev.map((m) => 
              m.id === aiMessageId ? { ...m, text: currentSlice } : m
            )
          );

          if (currentIdx >= fullText.length) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
        }, 15); // 15ms interval
      }

      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Chat request aborted');
        return;
      }
      console.error('Chat error:', err);
      
      // Remove any incomplete message and append error message
      setMessages((prev) => {
        const filtered = prev.filter(m => !m.id.startsWith('ai-') || m.text.length > 0);
        return [
          ...filtered,
          {
            id: `err-${Date.now()}`,
            role: 'ai',
            text: t.error,
            timestamp: new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="chat-widget">
      {/* Floating Action Button */}
      <button 
        className="chat-widget__trigger"
        onClick={handleOpenToggle}
        aria-label="Open Monolith AI chat"
        aria-expanded={isOpen}
      >
        <ChatIcon />
        {hasPulse && <div className="chat-widget__pulse" />}
      </button>

      {/* Chat Box Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chat-widget__window"
            data-lenis-prevent
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="chat-widget__header">
              <div className="chat-widget__info">
                <div className="chat-widget__status-dot" />
                <span className="chat-widget__title">{t.title}</span>
                <span className="chat-widget__subtitle">{t.subtitle}</span>
              </div>
              <button 
                className="chat-widget__close"
                onClick={handleCloseChat}
                aria-label="Close chat"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Messages List */}
            <div className="chat-widget__body" data-lenis-prevent>
              {messages.map((m) => (
                <div 
                  key={m.id}
                  className={`chat-widget__msg-wrapper chat-widget__msg-wrapper--${m.role}`}
                >
                  <div 
                    className={`chat-widget__msg chat-widget__msg--${m.role}`}
                    dangerouslySetInnerHTML={{ __html: formatMessage(m.text) }}
                  />
                  <div className="chat-widget__time">{m.timestamp}</div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="chat-widget__msg-wrapper chat-widget__msg-wrapper--ai">
                  <div className="chat-widget__msg chat-widget__msg--ai">
                    <div className="chat-widget__typing">
                      <div className="chat-widget__typing-dot" />
                      <div className="chat-widget__typing-dot" />
                      <div className="chat-widget__typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Chips (Only show when there is no user input activity in chat yet) */}
            {messages.length === 1 && !isLoading && (
              <div className="chat-widget__chips-container" data-lenis-prevent>
                <div className="chat-widget__chips-title">{t.chipsTitle}</div>
                <div className="chat-widget__chips">
                  {chips.map((chip, idx) => (
                    <button
                      key={idx}
                      className="chat-widget__chip"
                      onClick={() => handleSendMessage(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="chat-widget__footer">
              <form className="chat-widget__form" onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  className="chat-widget__input"
                  placeholder={t.placeholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="chat-widget__send-btn"
                  disabled={isLoading || !inputValue.trim()}
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
