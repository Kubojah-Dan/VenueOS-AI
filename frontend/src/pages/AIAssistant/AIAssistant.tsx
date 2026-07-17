import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../app/providers';
import { API_URL } from '../../config';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  FileText,
  Compass,
  ArrowRight,
  BookOpen,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant: React.FC = () => {
  const { role, crowd, sustainability, incidents, matches } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to VenueOS AI Dispatch Assistant\n\nI am connected to the Lusail Stadium smart grid, gates, and incident databases. How can I support your shift as **${role}**?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    { text: 'What is the wait time at Gate A?', category: 'Crowds' },
    { text: 'Show active operations incidents', category: 'Security' },
    { text: 'What is the live energy status?', category: 'Sustainability' },
    { text: 'What is the live match score?', category: 'Matches' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      
      const cleanText = text.replace(/[#*`>]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech Synthesis not supported in this browser.');
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const SpeechResult = event.results[0][0].transcript;
        setInput(SpeechResult);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      // Simulate Voice Input
      setIsListening(true);
      setTimeout(() => {
        setInput('Show active operations incidents');
        setIsListening(false);
      }, 1500);
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsgId = 'msg-' + Date.now();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsTyping(true);

    const botMsgId = 'bot-' + Date.now();

    const addOrUpdateBotMessage = (contentChunk: string) => {
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== botMsgId);
        return [
          ...filtered,
          { id: botMsgId, role: 'assistant', content: contentChunk }
        ];
      });
    };

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          role,
          history: chatHistory
        })
      });

      if (res.ok) {
        const data = await res.json();
        const words = data.response.split(' ');
        let tempText = '';
        for (let i = 0; i < words.length; i++) {
          tempText += words[i] + ' ';
          addOrUpdateBotMessage(tempText);
          await new Promise((r) => setTimeout(r, 15));
        }
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      console.warn('Chat server offline. Running local client-side assistant emulations.');
      await simulateClientRAG(textToSend, addOrUpdateBotMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const simulateClientRAG = async (query: string, updateCb: (content: string) => void) => {
    const q = query.toLowerCase();
    let reply = '';

    if (q.includes('gate') || q.includes('queue') || q.includes('wait') || q.includes('crowd')) {
      const waitTimes = crowd.gates.map((g) => `* **${g.name}**: ${g.queueTimeMin} mins wait`).join('\n');
      reply = `### Live Gate Congestion Briefing
Live stadium occupancy: **${crowd.totalOccupancy.toLocaleString()} / ${crowd.maxCapacity.toLocaleString()}** (${crowd.occupancyPercentage}% capacity).

**Current Queue Dynamics:**
${waitTimes}

> [!TIP]
> Redirect incoming shuttles from Parking Alpha to **Gate C (South)** which is currently clear with minimal wait times.`;
    } else if (q.includes('incident') || q.includes('emergency') || q.includes('security')) {
      const active = incidents.filter(i=>i.status!=='RESOLVED');
      const list = active.map(i=>`* **[${i.id}]** ${i.category} in ${i.location}: ${i.description} (${i.severity})`).join('\n');
      reply = `### Operations Command Dispatch Log
Currently monitoring **${active.length} active dispatches**:

${list || '*All areas reported nominal. No active dispatches.*'}

${active.some(i=>i.severity==='CRITICAL') ? `> [!IMPORTANT]\n> Turnstile readers are currently offline at Gate A. Voluteers are checking tickets manually.` : ''}`;
    } else if (q.includes('sustainability') || q.includes('energy') || q.includes('solar') || q.includes('power')) {
      reply = `### Grid Sustainability Report
* **Live Energy load**: ${sustainability.liveEnergyUsageKw} kW
* **Solar grid contribution**: ${sustainability.solarContributionPercent}% of total demand
* **Peak load ceiling**: ${sustainability.peakEnergyUsageKw} kW

> [!NOTE]
> HVAC automation units in Sector East are power-saving, optimizing total grid demand.`;
    } else if (q.includes('match') || q.includes('score') || q.includes('who is playing') || q.includes('game') || q.includes('schedule') || q.includes('fixtures') || q.includes('semi-final')) {
      const live = matches.find(m => m.status === 'LIVE');
      const scheduled = matches.filter(m => m.status === 'SCHEDULED');
      const finished = matches.filter(m => m.status === 'FINISHED');

      let details = '';
      if (live) {
        details += `### Live Match Active Now\n\n`;
        details += `* **Game**: **${live.homeTeam} vs ${live.awayTeam}**\n`;
        details += `* **Scoreline**: **${live.homeScore} - ${live.awayScore}**\n`;
        details += `* **Time**: Minute ${live.minute}'\n\n`;
      }

      if (scheduled.length > 0) {
        details += `### Upcoming Matches Today\n\n`;
        scheduled.forEach(m => {
          const timeStr = new Date(m.dateTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';
          details += `* **${m.homeTeam} vs ${m.awayTeam}** - Scheduled kickoff at **${timeStr}** (${m.group})\n`;
        });
        details += `\n`;
      }

      if (finished.length > 0) {
        details += `### Recent Results\n\n`;
        finished.forEach(m => {
          details += `* **${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}** (Final)\n`;
        });
      }

      if (matches.length === 0) {
        details = 'No active or upcoming match schedules are loaded in the database.';
      }

      reply = `### Tournament Scoreboard & Schedules\n\n${details}`;
    } else {
      reply = `### VenueOS AI Copilot
I am your smart stadium operations assistant.

Indexed sources:
* **Stadium Guidelines Directory (lusail.txt)**
* **Real-time Crowds & Incidents telemetry**

Ask me details about queue times, medical dispatches, or power grids.`;
    }

    const words = reply.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      current += words[i] + ' ';
      updateCb(current);
      await new Promise((r) => setTimeout(r, 15));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:h-[calc(100vh-140px)] overflow-y-auto lg:overflow-hidden font-sans">
      
      {/* CHAT INTERACTIVE VIEWPORT */}
      <div className="lg:col-span-3 flex flex-col bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-2xl shadow-premium overflow-hidden h-[500px] lg:h-full">
        
        {/* CHAT HEADER */}
        <div className="px-6 py-3.5 border-b border-gray-150 dark:border-graphite-800 bg-gray-55 dark:bg-graphite-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-500/10 text-forest-500 dark:text-forest-400 flex items-center justify-center border border-forest-500/10">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-800 dark:text-white block">VenueOS AI Dispatch Assistant</span>
              <span className="text-[9px] text-gray-400 font-semibold tracking-wide">Streaming Llama 3.3 70B & Dynamic RAG context</span>
            </div>
          </div>
        </div>

        {/* MESSAGES LOGS */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/50 dark:bg-graphite-950/20">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col space-y-2 max-w-3xl ${m.role === 'user' ? 'ml-auto items-end' : 'items-start'}`}
            >
              {/* Message Header Label */}
              <div className="flex items-center space-x-2 px-1">
                <span className={`w-2 h-2 rounded-full ${m.role === 'user' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                <span className="text-[11px] font-extrabold text-gray-405 dark:text-gray-500 uppercase tracking-wider">
                  {m.role === 'user' ? `You (${role})` : 'System Copilot'}
                </span>
              </div>

              {/* Message Content Bubble */}
              <div className="flex items-start space-x-3 max-w-full">
                {m.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-xl bg-forest-500 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-forest-650 shadow-premium mt-0.5">
                    AI
                  </div>
                )}
                
                <div className="space-y-1.5 max-w-full">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed border shadow-premium-lg ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-forest-500 to-forest-600 text-white border-forest-650 rounded-tr-none'
                      : 'bg-white/70 dark:bg-graphite-900/60 backdrop-blur-md text-gray-800 dark:text-gray-200 border-gray-150/40 dark:border-graphite-800/40 rounded-tl-none'
                  }`}>
                    <div className="space-y-2.5">
                      {m.content.split('\n').map((line, lIdx) => {
                        if (line.startsWith('###')) {
                          return <h4 key={lIdx} className="font-bold text-sm text-gray-900 dark:text-white pt-1">{line.replace('###', '')}</h4>;
                        }
                        if (line.startsWith('*')) {
                          return <p key={lIdx} className="pl-3.5 relative before:absolute before:left-0 before:content-['•'] text-gray-600 dark:text-gray-300 font-semibold">{line.replace('*', '').trim()}</p>;
                        }
                        if (line.startsWith('>')) {
                          return <div key={lIdx} className="p-3 border-l-3 border-amber-500 bg-amber-500/5 text-xs my-1.5 rounded-lg font-medium">{line.replace(/[>!\[\]]/g, '')}</div>;
                        }
                        return <p key={lIdx} className="font-semibold text-gray-700 dark:text-gray-200">{line}</p>;
                      })}
                    </div>
                  </div>

                  {m.role === 'assistant' && (
                    <button
                      onClick={() => handleSpeak(m.content)}
                      className="flex items-center space-x-1.5 py-1.5 px-3 text-[10px] text-gray-400 hover:text-gray-650 dark:hover:text-gray-250 font-bold hover:bg-gray-100 dark:hover:bg-graphite-800 rounded-md transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking ? 'Mute Speech' : 'Speak Message'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex flex-col space-y-2 items-start">
              <div className="flex items-center space-x-2 px-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-extrabold text-gray-450 uppercase tracking-wider">System Copilot</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-forest-500 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-forest-650 shadow-premium">
                  AI
                </div>
                <div className="bg-white/70 dark:bg-graphite-900/60 backdrop-blur-md border border-gray-150/40 dark:border-graphite-800/40 rounded-xl rounded-tl-none px-4 py-3 flex items-center space-x-1.5 shadow-premium-lg">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BOX */}
        <div className="p-4 border-t border-gray-150 dark:border-graphite-800 bg-gray-55 dark:bg-graphite-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center space-x-2.5"
          >
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-lg border transition-all ${
                isListening
                  ? 'bg-red-500/10 text-red-500 border-red-200 animate-pulse scale-105'
                  : 'bg-white dark:bg-graphite-800 border-gray-200 dark:border-graphite-700 text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white shadow-premium'
              }`}
              title="Record voice"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white dark:bg-graphite-900 border border-gray-250 dark:border-graphite-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-forest-500 text-gray-900 dark:text-white font-medium"
              placeholder="Ask about Gate queues, operations dispatches, solar grid loads..."
            />
            <button
              type="submit"
              className="p-2.5 bg-forest-500 hover:bg-forest-600 text-white rounded-lg transition-colors shadow-premium flex items-center justify-center shrink-0"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

      </div>

      {/* RAG CONTEXT PANEL */}
      <div className="bg-white/70 dark:bg-graphite-900/60 backdrop-blur-md border border-gray-150/40 dark:border-graphite-800/40 rounded-2xl shadow-premium p-5 flex flex-col h-auto lg:h-full overflow-hidden">
        <div className="flex items-center space-x-2.5 mb-4">
          <BookOpen className="w-4.5 h-4.5 text-forest-500" />
          <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Semantic Knowledge</h3>
        </div>
        
        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold mb-4 leading-relaxed">
          The AI engine searches and matches semantic embeddings from raw stadium policy books and transit directives.
        </p>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="p-3 bg-gray-50 dark:bg-graphite-800 border border-gray-100 dark:border-graphite-800 rounded-xl space-y-1.5 hover:border-forest-500/10 transition-all duration-300">
            <span className="text-[11px] font-bold text-forest-500 block">lusail.txt (Ingested)</span>
            <p className="text-[11px] text-gray-500 dark:text-gray-405 leading-normal font-semibold">
              Guidelines covering Gate entries, emergency assembly points, escalators, and HVAC energy rules.
            </p>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-graphite-800 border border-gray-100 dark:border-graphite-800 rounded-xl space-y-1.5 hover:border-forest-500/10 transition-all duration-300">
            <span className="text-[11px] font-bold text-gray-550 block">evacuation_plan.json</span>
            <p className="text-[11px] text-gray-550 dark:text-gray-405 leading-normal font-semibold">
              Sector exits mapped directly to assembly zones. Tactical ingress gates for emergency response.
            </p>
          </div>
        </div>

        {/* SUGGESTED QUESTIONS */}
        <div className="mt-4 pt-4 border-t border-gray-150 dark:border-graphite-800 space-y-2">
          <div className="flex items-center space-x-1.5 text-gray-450 mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450">Quick Suggestions</span>
          </div>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.text)}
              className="w-full text-left p-3 border border-gray-50 dark:border-graphite-800 hover:bg-gray-50 dark:hover:bg-graphite-800 rounded-xl text-xs text-gray-650 dark:text-gray-400 font-bold flex items-center justify-between transition-all hover:translate-x-1 group"
            >
              <span>{q.text}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-forest-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
export default AIAssistant;
