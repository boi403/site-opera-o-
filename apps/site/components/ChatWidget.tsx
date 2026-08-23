import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, Send, MessageCircle, User, Bot, Loader2, ExternalLink, Mic, Volume2 } from 'lucide-react';
import { requestConciergeReply } from '../shared/ai/client';
import { trackAIEvent } from '../shared/ai/analytics';
import { createSpeechRecognizer, speakText } from '../shared/ai/voice';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Ola! Sou o concierge virtual do Araguaia Palace Hotel. Posso ajudar com horarios, servicos, localizacao e informacoes gerais.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'Qual o horario de check-in?',
    'O cafe da manha esta incluso?',
    'O hotel aceita pet?',
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);

  const whatsappNumber = '5566996029294';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Ola! Estava no site e gostaria de tirar uma duvida.`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const recognizer = createSpeechRecognizer();
    recognizerRef.current = recognizer;

    if (!recognizer) return;

    recognizer.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      setInput(transcript);
      setIsListening(false);
      trackAIEvent('site', 'voice_input', 'site_concierge_voice', { transcript });
    };

    recognizer.onerror = () => setIsListening(false);
    recognizer.onend = () => setIsListening(false);
  }, []);

  const handleSend = async (messageOverride?: string) => {
    const userMessage = (messageOverride ?? input).trim();
    if (!userMessage || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);
    trackAIEvent('site', 'chat_question', userMessage);

    try {
      const response = await requestConciergeReply({
        message: userMessage,
        messages,
      });

      setMessages((prev) => [...prev, { role: 'assistant', text: response.reply }]);
      setSuggestions(response.suggestions || []);
      trackAIEvent('site', response.escalated ? 'chat_escalation' : 'chat_answer', userMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'No momento estou indisponivel, mas nossa equipe esta online no WhatsApp para te ajudar agora mesmo.',
        },
      ]);
      trackAIEvent('site', 'chat_error', 'concierge_failure', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognizerRef.current || isListening || isLoading) return;
    setIsListening(true);
    recognizerRef.current.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[560px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden animate-scale origin-bottom-right">
          <div className="bg-[#002D44] p-5 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFD700] p-2 rounded-xl">
                <Bot className="w-5 h-5 text-[#002D44]" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Concierge Virtual</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">IA com fallback humano</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#E31B23]' : 'bg-[#FFD700]'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#002D44]" />}
                  </div>
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#E31B23] text-white rounded-tr-none'
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#002D44]"
                      >
                        <Volume2 className="w-3 h-3" />
                        Ouvir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="flex gap-2 items-center text-slate-400 text-xs font-medium bg-white p-3 rounded-2xl border border-slate-100">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Araguaia esta digitando...
                </div>
              </div>
            )}

            {!isLoading && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-[#002D44]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-6 py-3 bg-white border-t border-slate-50">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAIEvent('site', 'whatsapp_click', 'chat_widget_whatsapp')}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-50 text-green-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-green-100 transition-colors border border-green-200"
            >
              <MessageCircle className="w-4 h-4" />
              Falar com Humano (WhatsApp)
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua duvida aqui..."
              className="flex-grow px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002D44] text-sm font-medium"
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={`p-3 rounded-2xl transition-all ${isListening ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-[#002D44] text-white rounded-2xl hover:bg-[#003d5c] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          trackAIEvent('site', 'chat_toggle', isOpen ? 'close_widget' : 'open_widget');
        }}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 transform hover:scale-110 active:scale-90 ${
          isOpen ? 'bg-white text-[#002D44] rotate-90' : 'bg-[#E31B23] text-white'
        }`}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
