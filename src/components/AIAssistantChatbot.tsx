import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, RefreshCw, ChevronDown } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const PREMIUM_SUGGESTIONS = [
  { label: '📅 3일 전체 일정 및 교육 구성', text: '3일 동안 어떤 과정으로 교육이 진행되나요?' },
  { label: '📝 수강 신청하려면 어떻게 하나요?', text: '교육 신청 방법과 필수 제출 정보를 안내해 주세요.' },
  { label: '💻 노트북 지참여부와 대여 기준', text: '노트북을 꼭 지참해야 하나요? 대여가 가능한지 알고 싶습니다.' },
  { label: '💡 3일차 데모 해커톤 과정 소개', text: '3일차에 진행하는 해커톤과 어워드는 무엇인가요?' },
];

export default function AIAssistantChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: '반갑습니다! 롯데GRS 아카데미의 [AX 부스터 과정] AI 실실무 응대 비서입니다. 3일차에 빛나는 해커톤 우수사례 창출과 실무 자동화 역량 부스팅을 위해 구체적인 커리큘럼, 일정 배정 및 신청 방식 요강 등 원하시는 내용을 실시간으로 성심껏 응대해 드리겠습니다. 😊 어떤 점이 궁금하신가요?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1); // To emphasize presence

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build the message history to pass back to server
      const requestMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: requestMessages })
      });

      if (!res.ok) {
        throw new Error('서버 응답 오류 발생');
      }

      const data = await res.json();
      
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || '답변을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '인터넷 연결이 원활하지 않거나 AI 챗봇 API가 오프라인 상태입니다. 잠시 후에 다시 요청해 주시기 바랍니다.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: '대화가 초기화되었습니다. 롯데GRS 아카데미 [AX 부스터 과정]에 관하여 추가로 궁금하신 내용을 새로 문의해 주세요! 🧑‍💻',
        timestamp: new Date(),
      }
    ]);
  };

  return (
    <div id="ai-realtime-chatbot" className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {/* CHAT WINDOW */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="mb-4 w-[380px] h-[550px] max-w-[calc(100vw-2rem)] bg-white border border-geo-border rounded-none shadow-2xl flex flex-col overflow-hidden"
          >
            {/* CHAT HEADER */}
            <div className="bg-geo-dark text-white px-5 py-4 flex items-center justify-between border-b border-geo-border relative">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-none border border-white/20 bg-geo-blue flex items-center justify-center relative shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs tracking-wider uppercase font-mono">AX BOOSTER CONTROLLER</span>
                    <span className="text-[8px] bg-geo-blue px-1.5 py-0.2 uppercase text-white font-mono tracking-widest font-bold">REAL-TIME</span>
                  </div>
                  <h3 className="text-xs font-semibold text-white/90">롯데GRS 아카데미 실시간 AI 비서</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-1.5 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-none cursor-pointer"
                  title="대화 초기화"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-none cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CHAT BODY */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#FCFBFA] space-y-4">
              {/* BRAND CHAT BANNER */}
              <div className="p-3 bg-geo-bg border border-geo-border/60 text-[10px] text-geo-gray-dark flex flex-col gap-1 rounded-none font-mono">
                <span className="font-bold text-geo-dark uppercase">💡 QUICK ACTION DIRECTIVITY</span>
                개인화된 실무 생산성 혁신과 전용 챗봇 설계 팁을 실시간 응대해 드립니다. 아래의 추천 인스턴스 질문을 누르거나 직접 자유롭게 기입하십시오.
              </div>

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-xs leading-relaxed transition-all rounded-none shadow-sm ${
                      m.role === 'user'
                        ? 'bg-geo-dark text-white border border-geo-dark'
                        : 'bg-white text-geo-dark border border-geo-border/80 font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.content}</div>
                    <div
                      className={`text-[8px] mt-1.5 font-mono ${
                        m.role === 'user' ? 'text-white/60 text-right' : 'text-geo-gray'
                      }`}
                    >
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {/* LOADING INDICATOR */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-geo-border/80 px-4 py-3 rounded-none shadow-sm flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-geo-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-geo-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-geo-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* QUICK SUGGESTIONS CONTAINER */}
              {messages.length === 1 && !isLoading && (
                <div className="space-y-1.5 pt-2">
                  <p className="text-[10px] font-mono text-geo-gray font-bold uppercase tracking-wider mb-2">💡 자주 묻는 질문 항목</p>
                  <div className="flex flex-col gap-1.5">
                    {PREMIUM_SUGGESTIONS.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(s.text)}
                        className="text-left py-2 px-3 bg-white border border-geo-border text-xs text-geo-gray-dark hover:text-geo-blue hover:border-geo-blue bg-white hover:bg-geo-bg/40 transition-all rounded-none cursor-pointer font-sans"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* CHAT INPUT FORM */}
            <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-geo-border flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="과정 신청, 일정 등 궁금한 사항을 기입하세요."
                className="flex-1 h-10 px-3 bg-[#F8F8F7] border border-geo-border text-xs focus:bg-white focus:border-geo-dark transition-all outline-none rounded-none focus:ring-0 font-sans"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 bg-geo-dark hover:bg-geo-blue text-white flex items-center justify-center transition-colors shadow-sm disabled:opacity-45 disabled:hover:bg-geo-dark rounded-none cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOAT FLOATING BUTTON */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`w-14 h-14 rounded-none shadow-2xl flex items-center justify-center transition-all cursor-pointer relative border ${
          isOpen
            ? 'bg-geo-dark text-white border-geo-dark hover:bg-geo-blue'
            : 'bg-geo-blue text-white border-geo-blue hover:bg-geo-dark'
        }`}
        title="교육 안내 실시간 AI 챗봇"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <MessageSquare className="w-6 h-6" />
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* UNREAD NOTIFICATION BADGE */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border border-white">
            1
          </span>
        )}
      </motion.button>
    </div>
  );
}
