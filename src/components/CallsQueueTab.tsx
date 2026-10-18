import React, { useState } from 'react';
import { 
  PhoneCall, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  AlertCircle, 
  Trash2, 
  ExternalLink, 
  Play, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  Send,
  Zap,
  Radio,
  Share2
} from 'lucide-react';
import { ScheduledReminder, LanguageCode } from '../types';
import { soundEffects, AI_VOICE_PROFILES } from '../utils/speechVoice';

interface CallsQueueTabProps {
  currentLang: LanguageCode;
  reminders: ScheduledReminder[];
  onOpenSchedule: () => void;
  onOpenSimulatorForReminder: (reminder: ScheduledReminder) => void;
  onDeleteReminder: (id: string) => void;
  onUpdateReminderStatus: (id: string, status: ScheduledReminder['status']) => void;
}

export const CallsQueueTab: React.FC<CallsQueueTabProps> = ({
  currentLang,
  reminders,
  onOpenSchedule,
  onOpenSimulatorForReminder,
  onDeleteReminder,
  onUpdateReminderStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'fallback'>('all');

  const filtered = reminders.filter((item) => {
    const matchesSearch = 
      item.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phoneNumber.includes(searchQuery) ||
      item.callGoal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.whatsappMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'scheduled') return item.status === 'scheduled';
    if (filterStatus === 'completed') return item.status === 'completed';
    if (filterStatus === 'fallback') return item.status === 'whatsapp_fallback_sent' || item.status === 'sms_fallback_sent';

    return true;
  });

  const getCountdownString = (isoDate: string) => {
    const target = new Date(isoDate).getTime();
    const diff = target - Date.now();
    if (diff <= 0) return 'Due now / Past';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `In ${days} day${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) return `In ${hours}h ${mins}m`;
    return `In ${mins} mins`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Future Call AI Reminder Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold mb-3">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {currentLang === 'hi' 
                ? 'भविष्य के AI कॉल रिमाइंडर्स और स्वचालित व्हाट्सएप संदेश' 
                : currentLang === 'mr' 
                ? 'भविष्यातील AI कॉल रिमाइंडर्स व स्वयंचलित व्हॉट्सॲप मेसेज' 
                : 'Future Call AI Reminders & Automated WhatsApp Messages'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {currentLang === 'hi'
              ? 'निर्धारित समय पर AI कॉल करेगा • न उठने पर स्वतः व्हाट्सएप संदेश जाएगा'
              : currentLang === 'mr'
              ? 'नियोजित वेळेवर AI कॉल करेल • न उचलल्यास थेट व्हॉट्सॲप निरोप पोहोचेल'
              : 'Smart Future Voice Reminders & Auto-Failover WhatsApp Messaging'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentLang === 'hi'
              ? 'दवाइयों की याद, बिजनेस मीटिंग, जन्मदिवस बधाई या भुगतान का विनम्र संदेश पहले से तय करें। AI सकारात्मक भाषा में कॉल करेगा और कॉल मिस होने पर तुरंत व्हाट्सएप संदेश भेजेगा।'
              : currentLang === 'mr'
              ? 'औषध घेण्याची आठवण, महत्त्वाची बैठक, वाढदिवस सदिच्छा किंवा नम्र देयक आठवण वेळेआधी शेड्यूल करा. कॉल न उचलल्यास त्वरित व्हॉट्सॲप संदेश रवाना होतो.'
              : 'Queue reminders for medicine, client meetings, celebrations, or payment follow-ups. If unanswered, polite WhatsApp message is automatically triggered.'}
          </p>
        </div>

        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenSchedule();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>
            {currentLang === 'hi' ? '+ नया फ्यूचर रिमाइंडर जोड़ें' : currentLang === 'mr' ? '+ नवीन फ्युचर रिमाइंडर जोडा' : '+ Schedule Future Reminder'}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={currentLang === 'hi' ? 'नाम, फोन नंबर या व्हाट्सएप संदेश खोजें...' : currentLang === 'mr' ? 'नाव, फोन नंबर किंवा व्हॉट्सॲप मेसेज शोधा...' : 'Search by contact, number or WhatsApp text...'}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          {[
            { id: 'all', label: currentLang === 'mr' ? `सर्व (${reminders.length})` : currentLang === 'hi' ? `सभी (${reminders.length})` : `All (${reminders.length})` },
            { id: 'scheduled', label: currentLang === 'mr' ? '⏰ नियोजित फ्युचर' : currentLang === 'hi' ? '⏰ निर्धारित फ्यूचर' : '⏰ Future Scheduled' },
            { id: 'completed', label: currentLang === 'mr' ? '✓ यशस्वी' : currentLang === 'hi' ? '✓ सफल' : '✓ Completed' },
            { id: 'fallback', label: currentLang === 'mr' ? '💬 व्हॉट्सॲप फॉलबॅक' : currentLang === 'hi' ? '💬 व्हाट्सएप फॉलबॅक' : '💬 WhatsApp Sent' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playClick();
                setFilterStatus(tab.id as 'all' | 'scheduled' | 'completed' | 'fallback');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-400">
            <Clock className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold">
              {currentLang === 'hi' ? 'कोई मेल खाने वाला फ्यूचर कॉल या व्हाट्सएप रिमाइंडर नहीं मिला' : currentLang === 'mr' ? 'कोणताही जुळणारा फ्युचर कॉल किंवा व्हॉट्सॲप रिमाइंडर सापडला नाही' : 'No matching future reminders found'}
            </p>
            <button
              onClick={onOpenSchedule}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              + {currentLang === 'hi' ? 'पहला फ्यूचर रिमाइंडर बनाएं' : currentLang === 'mr' ? 'पहिला फ्युचर रिमाइंडर बनवा' : 'Create First Future Reminder'}
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const isScheduled = item.status === 'scheduled';
            const isCompleted = item.status === 'completed';
            const isFallback = item.status === 'whatsapp_fallback_sent' || item.status === 'sms_fallback_sent';

            const cleanPhone = item.phoneNumber.replace(/[^\d]/g, '');
            const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(item.whatsappMessage)}`;
            const countdown = getCountdownString(item.scheduledDateTime);

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-md transition-all space-y-4"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isScheduled
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : isCompleted
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    }`}>
                      {isFallback ? <MessageSquare className="w-6 h-6" /> : <PhoneCall className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-white text-base sm:text-lg">
                          {item.contactName}
                        </h3>
                        <span className="font-mono text-xs text-slate-400">
                          {item.phoneNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {item.language === 'mr' ? '🚩 मराठी' : item.language === 'hi' ? '🇮🇳 हिंदी' : item.language === 'gu' ? '🇮🇳 ગુજરાતી' : '🌐 English'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          🎙️ {AI_VOICE_PROFILES.find((v) => v.id === item.voiceId)?.name || 'Priya AI'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300">
                          {item.voiceTone} Tone
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.callGoal}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status & Timing Pill */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isScheduled && (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                        <span>{countdown}</span>
                      </span>
                    )}

                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      isScheduled
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    }`}>
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {isFallback && <MessageSquare className="w-3.5 h-3.5 text-teal-400" />}
                      <span>{item.status.replace(/_/g, ' ').toUpperCase()}</span>
                    </span>
                  </div>
                </div>

                {/* Spoken Script & Fallback Messaging Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Spoken Voice Script Card */}
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-indigo-400 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-indigo-400" />
                          <span>AI Spoken Message (Delivered on Call):</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          🗓️ {new Date(item.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-200 font-serif italic leading-relaxed">
                        "{item.customScript}"
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Scheduled for {new Date(item.scheduledDateTime).toLocaleDateString()}</span>
                      <button
                        onClick={() => {
                          soundEffects.playClick();
                          onOpenSimulatorForReminder(item);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>Test Call Now</span>
                      </button>
                    </div>
                  </div>

                  {/* Fallback Message Card (Normal Text SMS or WhatsApp) */}
                  {item.fallbackOption === 'call_then_sms' ? (
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-sky-500/40 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-sky-400 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5 text-sky-400" />
                            <span>Normal Text Message (SMS) Fallback:</span>
                          </span>
                          <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono">
                            Auto-SMS on Missed Call
                          </span>
                        </div>

                        {/* Blue SMS Bubble */}
                        <div className="flex justify-end">
                          <div className="max-w-[95%] bg-sky-600 text-white text-xs p-3 rounded-xl rounded-tr-none shadow-md leading-relaxed font-mono">
                            <p className="whitespace-pre-line">{item.smsMessage || item.whatsappMessage}</p>
                            <div className="flex items-center justify-end text-[9px] text-sky-200 mt-1.5">
                              <span>Delivered via Mobile Carrier</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-sky-400">Carrier SMS Gateway</span>
                        <a
                          href={`sms:${cleanPhone}?body=${encodeURIComponent(item.smsMessage || item.whatsappMessage)}`}
                          className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold text-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Open SMS App</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0b141a] p-4 rounded-2xl border border-emerald-900/50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 mb-2">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WhatsApp Fallback Message:</span>
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                            Auto-Dispatched on No Answer
                          </span>
                        </div>

                        {/* Green WhatsApp Bubble */}
                        <div className="flex justify-end">
                          <div className="max-w-[95%] bg-[#005c4b] text-[#e9edef] text-xs p-3 rounded-xl rounded-tr-none shadow-md leading-relaxed">
                            <p className="whitespace-pre-line font-sans">{item.whatsappMessage}</p>
                            <div className="flex items-center justify-end gap-1 text-[9px] text-[#8696a0] mt-1.5 font-mono">
                              <span>{new Date(item.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="text-[#53bdeb] font-bold">✓✓</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Direct Action */}
                      <div className="mt-3 pt-2 border-t border-emerald-950 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-500/80">Meta WhatsApp Cloud Gateway</span>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold text-xs"
                        >
                          <span>Open in WhatsApp</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                </div>

                {/* Outcome Notes if any */}
                {item.callOutcomeNotes && (
                  <div className="text-[11px] bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-slate-300 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Delivery Log: {item.callOutcomeNotes}</span>
                  </div>
                )}

                {/* Bottom Actions Bar */}
                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800/80 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {isScheduled 
                        ? `Target Execution: ${new Date(item.scheduledDateTime).toLocaleString()} (${countdown})` 
                        : `Created on: ${new Date(item.createdAt).toLocaleDateString()}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Live Simulator button */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        onOpenSimulatorForReminder(item);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
                    >
                      <Play className="w-3 h-3 text-indigo-400" />
                      <span>{currentLang === 'hi' ? 'टेस्ट कॉल करें' : currentLang === 'mr' ? 'कॉल टेस्ट करा' : 'Simulate Call'}</span>
                    </button>

                    {/* Direct WhatsApp link button */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold flex items-center gap-1.5 transition-all shadow"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>Send WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        onDeleteReminder(item.id);
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
                      title="Delete future reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
