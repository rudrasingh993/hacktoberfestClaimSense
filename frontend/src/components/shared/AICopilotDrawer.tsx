import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, AlertCircle, Copy, Check, ChevronRight } from 'lucide-react';
import { useEstimate } from '../../context/EstimateContext';
import { api } from '../../services/api';
import { AIChatMessage } from '../../types';

export const AICopilotDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { result, policy, language } = useEstimate();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Namaste! I am your ClaimSense Pre-Admission AI Copilot. Ask me anything about proportionate deductions, room rent limits, IRDAI rules, or how to negotiate bill unbundling with hospital billing desks.',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const newMessages: AIChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.chatWithCopilot({
        message: text,
        history: newMessages.slice(-6),
        current_estimate: result,
        policy: policy,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to connect to AI engine: ${err.message || 'Offline mode active'}. Using built-in calculation and policy guidelines.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const suggestions = [
    'Why are doctor fees deducted when room limit is breached?',
    'What is proportionate deduction formula in India?',
    'How do I ask hospital billing to unbundle room and doctor fees?',
    'What non-medical consumables can I dispute on the bill?',
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center space-x-2.5 font-medium border border-emerald-400/30"
          title="Open ClaimSense AI Pre-Admission Copilot"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
          </div>
          <span className="hidden sm:inline text-sm font-semibold tracking-wide">Ask ClaimSense AI</span>
          <span className="text-[10px] bg-emerald-800/60 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider text-emerald-200">
            Copilot
          </span>
        </button>
      )}

      {/* Drawer Overlay & Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-600/30 border border-emerald-500/50 rounded-lg text-emerald-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-white flex items-center space-x-2">
                    <span>ClaimSense AI Copilot</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase">
                      Offline / Local
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Pre-Admission & TPA Negotiation Guidance</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Close AI Copilot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Context Banner */}
            {result && (
              <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 text-xs flex items-center justify-between text-emerald-800">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Estimate: Total ₹{(result.total_bill_paise / 100).toLocaleString('en-IN')} | Insurer:{' '}
                    ₹{((result.insurer_payment_paise || 0) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="font-semibold text-emerald-700">
                  Ratio: {result.room_limit_ratio?.toFixed(2) || '1.00'}
                </span>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.role === 'assistant' && idx > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end">
                        <button
                          onClick={() => copyToClipboard(msg.content, idx)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center space-x-1"
                        >
                          {copiedIdx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy response</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center space-x-2 text-slate-500 text-xs bg-white p-3 rounded-xl border border-slate-200 max-w-[200px]">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>AI Copilot thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips */}
            <div className="p-3 bg-white border-t border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <span>Suggested Pre-Admission Queries</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    disabled={loading}
                    className="text-left text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 transition"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about room rent limits, IRDAI rules..."
                  disabled={loading}
                  className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-sm"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center space-x-1">
                <AlertCircle className="w-3 h-3 text-slate-400" />
                <span>Financial math is computed deterministically. AI provides explanation and guidance.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
