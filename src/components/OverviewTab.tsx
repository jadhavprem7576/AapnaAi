import React, { useState } from 'react';
import { 
  PhoneCall, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  User, 
  Zap, 
  Volume2, 
  RefreshCw,
  Crown,
  Play,
  Square,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { ScheduledReminder, LanguageCode, UserProfile, AdminSettings, ThemeAccent } from '../types';
import { soundEffects, AI_VOICE_PROFILES, speakText, stopSpeaking } from '../utils/speechVoice';
import { SchedulePreset } from './ScheduleModal';

interface OverviewTabProps {
  currentLang: LanguageCode;
  reminders: ScheduledReminder[];
  profile: UserProfile;
  adminSettings: AdminSettings;
  activeTheme?: ThemeAccent;
  onOpenSchedule: () => void;
  onOpenScheduleWithPreset?: (preset: SchedulePreset) => void;
  onOpenSimulatorForReminder: (reminder: ScheduledReminder) => void;
  onOpenSubscription: () => void;
  onOpenGuide: () => void;
  onOpenAdmin: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  currentLang,
  reminders,
  profile,
  adminSettings,
  activeTheme = 'indigo',
  onOpenSchedule,
  onOpenScheduleWithPreset,
  onOpenSimulatorForReminder,
  onOpenSubscription,
  onOpenGuide,
  onOpenAdmin,
  onTriggerSync,
  isSyncing,
}) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const scheduledList = reminders.filter((r) => r.status === 'scheduled');
  const completedList = reminders.filter((r) => r.status === 'completed');
  const fallbackList = reminders.filter((r) => r.status === 'whatsapp_fallback_sent' || r.status === 'sms_fallback_sent');

  // Next upcoming reminder
  const nextReminder = [...scheduledList].sort(
    (a, b) => new Date(a.scheduledDateTime).getTime() - new Date(b.scheduledDateTime).getTime()
  )[0];

  const handlePlayVoice = (voiceId: string, sampleText: string, lang: LanguageCode) => {
    if (playingVoiceId === voiceId) {
      stopSpeaking();
      setPlayingVoiceId(null);
      return;
    }
    soundEffects.playClick();
    stopSpeaking();
    setPlayingVoiceId(voiceId);
    speakText(sampleText, lang, 'empathetic', () => {
      setPlayingVoiceId(null);
    }, voiceId);
  };

  const handleLaunchPreset = (preset: SchedulePreset) => {
    soundEffects.playClick();
    if (onOpenScheduleWithPreset) {
      onOpenScheduleWithPreset(preset);
    } else {
      onOpenSchedule();
    }
  };

  // Quick Presets List
  const QUICK_SCENARIOS: { id: string; title: string; subtitle: string; icon: string; preset: SchedulePreset }[] = [
    {
      id: 'self_test',
      title: currentLang === 'mr' ? '⚡ स्वतःला २ मिनिटात कॉल करा' : currentLang === 'hi' ? '⚡ खुद को २ मिनट में कॉल करें' : '⚡ Test Myself in 2 Mins',
      subtitle: currentLang === 'mr' ? 'फोनवर त्वरित AI आवाज अनुभवा' : currentLang === 'hi' ? 'फोन पर तुरंत AI वॉइस का अनुभव लें' : 'Experience live AI voice on your phone',
      icon: '⚡',
      preset: {
        title: 'Instant AI Voice Test',
        goal: 'Testing AwaazAI Voice and WhatsApp failover',
        contactName: profile.name || 'Prem Jadhav',
        phoneNumber: profile.phoneNumber || '+91 98234 56789',
        dateOffsetMins: 2,
        templateId: 'pos_morning',
      },
    },
    {
      id: 'doctor',
      title: currentLang === 'mr' ? '🩺 डॉक्टरांची अपॉइंटमेंट' : currentLang === 'hi' ? '🩺 डॉक्टर की अपॉइंटमेंट' : '🩺 Doctor Appointment',
      subtitle: currentLang === 'mr' ? 'वेळ व औषधांचे स्मरणपत्र' : currentLang === 'hi' ? 'समय व दवाइयों का स्मरण' : 'Time & medicine reminder',
      icon: '🩺',
      preset: {
        title: 'Doctor Appointment & Wellness Reminder',
        goal: 'Doctor visit and timely checkup reminder',
        contactName: 'Aarav Kumar',
        phoneNumber: '+91 98765 12345',
        dateOffsetMins: 1440,
        templateId: 'pos_health',
      },
    },
    {
      id: 'meeting',
      title: currentLang === 'mr' ? '🤝 बिझनेस मीटिंग अलर्ट' : currentLang === 'hi' ? '🤝 बिजनेस मीटिंग अलर्ट' : '🤝 Business Meeting Call',
      subtitle: currentLang === 'mr' ? 'महत्त्वाच्या कामाची पूर्वकल्पना' : currentLang === 'hi' ? 'महत्वपूर्ण कार्य की पूर्व सूचना' : 'Pre-meeting briefing & agenda',
      icon: '🤝',
      preset: {
        title: 'Important Business Follow-up',
        goal: 'Meeting follow-up and brief discussion',
        contactName: 'Rohan Deshmukh',
        phoneNumber: '+91 98111 22334',
        dateOffsetMins: 120,
        templateId: 'pos_meeting',
      },
    },
    {
      id: 'payment',
      title: currentLang === 'mr' ? '💰 पेमेंट स्मरणपत्र' : currentLang === 'hi' ? '💰 पेमेंट स्मरण' : '💰 Polite Payment Reminder',
      subtitle: currentLang === 'mr' ? 'आदरयुक्त व नम्र फॉलो-अप' : currentLang === 'hi' ? 'आदरयुक्त व नम्र फॉलो-अप' : 'Polite & respectful payment follow-up',
      icon: '💰',
      preset: {
        title: 'Gentle Invoice Follow-up',
        goal: 'Friendly invoice reminder',
        contactName: 'Pooja Sharma',
        phoneNumber: '+91 98333 44556',
        dateOffsetMins: 1440,
        templateId: 'pos_payment',
      },
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: Welcome Action Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AwaazAI Multilingual Voice Engine</span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-400 font-semibold">{profile.subscriptionPlan.toUpperCase()} Plan</span>
              {profile.isFreeAccessGrantedByOwner && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400 font-bold">100% Free VIP Granted by Owner</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {currentLang === 'hi' 
                ? `नमस्ते, ${profile.name}! आपका AI कॉलर पूरी तरह सक्रिय है`
                : currentLang === 'mr'
                ? `नमस्कार, ${profile.name}! आपला AI कॉलर पूर्णतः सक्रिय आहे`
                : `Welcome, ${profile.name}! Your automated AI caller is ready`}
            </h1>

            <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {currentLang === 'hi'
                ? 'कैलेंडर पर तय तारीख व समय पर AI कॉल करेगा। यदि व्यक्ति फोन नहीं उठाता, तो उसे तुरंत आपका संदेश व्हाट्सएप और एसएमएस पर स्वतः भेजा जाएगा।'
                : currentLang === 'mr'
                ? 'कॅलेंडरवरील नियोजित वेळ व तारखेवर AI स्वतः कॉल करेल. फोन न उचलल्यास त्वरित व्हॉट्सॲप आणि SMS द्वारे आपला निरोप पोहचवला जाईल.'
                : 'Set any date and time on your calendar. The AI calls automatically with lifelike Indian voices, and dispatches automated WhatsApp & SMS fallbacks if unanswered.'}
            </p>
          </div>

          {/* Primary Quick Launch Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenSchedule();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {currentLang === 'hi' ? '+ नया कॉल शेड्यूल करें' : currentLang === 'mr' ? '+ नवीन कॉल शेड्यूल करा' : '+ Schedule New Call'}
              </span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenGuide();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-sm font-semibold transition-colors cursor-pointer"
            >
              <span>{currentLang === 'hi' ? 'ऐप कैसे काम करता है?' : currentLang === 'mr' ? 'वापराची माहिती' : 'Quick Guide'}</span>
            </button>
          </div>
        </div>

        {/* Subtle Ambient Glow */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* SECTION 2: 1-Click Fast Scenario Presets (Ease of Handling) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{currentLang === 'hi' ? '1-क्लिक त्वरित शेड्यूलिंग प्रीसेट्स' : currentLang === 'mr' ? '1-क्लिक त्वरित शेड्यूलिंग पर्याय' : '1-Click Quick Call Presets'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentLang === 'hi' ? 'बिना टाइप किए तुरंत कॉल और एसएमएस शेड्यूल करें' : currentLang === 'mr' ? 'टाईप न करता एका क्लिकवर कॉल व मेसेज पाठवा' : 'Launch pre-configured calls in 5 seconds with zero typing'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleLaunchPreset(sc.preset)}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group shadow-sm cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl mb-2">{sc.icon}</span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              <h3 className="text-xs font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                {sc.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {sc.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: Live AI Voice Preview Bar (Hindi, Marathi, English) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>
                {currentLang === 'hi'
                  ? 'J.A.R.V.I.S. व Neural HD वॉइस स्टूडियो (सुनकर देखें)'
                  : currentLang === 'mr'
                  ? 'J.A.R.V.I.S. व Neural HD व्हॉइस स्टुडिओ (आवाज ऐका)'
                  : 'J.A.R.V.I.S. & Neural HD Voice Studio'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentLang === 'hi'
                ? 'आयरन मैन के J.A.R.V.I.S., F.R.I.D.A.Y. और नेचुरल HD भारतीय आवाज़ें'
                : currentLang === 'mr'
                ? 'आयर्न मॅनचा J.A.R.V.I.S., F.R.I.D.A.Y. आणि नैसर्गिक HD भारतीय आवाज'
                : 'Iron Man’s J.A.R.V.I.S., F.R.I.D.A.Y. & Studio HD Indian voice personas'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              id: 'jarvis_ai',
              name: 'J.A.R.V.I.S. (Iron Man AI)',
              langLabel: 'Stark HD · EN / HI / MR',
              desc: 'Cybernetic British Tactical Butler for Prem Jadhav',
              sample:
                currentLang === 'mr'
                  ? 'नमस्कार सर! मी जार्विस बोलत आहे. आपली संपूर्ण कॉल सुरक्षा प्रणाली आणि स्मार्ट रिमाइंडर सिस्टिम आता ऑनलाईन आहे.'
                  : currentLang === 'hi'
                  ? 'नमस्कार सर! मैं जार्विस बोल रहा हूँ। आपके सभी कॉल डिफेंस प्रोटोकॉल और स्मार्ट रिमाइंडर सिस्टम पूरी तरह से ऑनलाइन हैं।'
                  : 'Good day, Sir. J.A.R.V.I.S. online. All Equal AI call defense protocols and voice reminders are active and standing by for Prem Jadhav.',
              lang: currentLang,
            },
            {
              id: 'friday_ai',
              name: 'F.R.I.D.A.Y. (Stark Tactical AI)',
              langLabel: 'Stark HD · Female AI',
              desc: 'Crisp Combat & Live Call Screening Receptionist',
              sample:
                currentLang === 'mr'
                  ? 'सिस्टिम ऑनलाईन आहे बॉस! मी फ्रायडे बोलत आहे. तुमच्या सर्व इनकमिंग कॉल्सची लाईव्ह स्क्रीनिंग सुरू आहे.'
                  : currentLang === 'hi'
                  ? 'सिस्टम ऑनलाइन है बॉस! मैं फ्राइडे बोल रही हूँ। आपके सभी इनकमिंग कॉल्स की लाइव स्क्रीनिंग चालू है।'
                  : 'Systems online, Boss! F.R.I.D.A.Y. here. Monitoring all incoming calls and ready to intercept spam in real time.',
              lang: currentLang,
            },
            {
              id: 'priya_hi',
              name: 'Priya HD (प्रिया)',
              langLabel: 'हिंदी Neural HD',
              desc: 'Warm & Caring Empathetic Hindi Voice',
              sample: 'नमस्ते! मैं प्रिया बोल रही हूँ। आपका महत्वपूर्ण संदेश देने के लिए यह कॉल किया गया है।',
              lang: 'hi' as LanguageCode,
            },
            {
              id: 'meera_mr',
              name: 'Meera HD (मीरा)',
              langLabel: 'मराठी Neural HD',
              desc: 'Affectionate & Polite Native Marathi',
              sample: 'नमस्कार! मी मीरा बोलत आहे. आपल्या महत्त्वाच्या निरोपासाठी आणि स्मरणपत्रासाठी हा कॉल आहे.',
              lang: 'mr' as LanguageCode,
            },
          ].map((v) => {
            const isPlaying = playingVoiceId === v.id;
            return (
              <div
                key={v.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPlaying 
                    ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500' 
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{v.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{v.langLabel}</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">{v.desc}</p>
                
                <button
                  type="button"
                  onClick={() => handlePlayVoice(v.id, v.sample, v.lang)}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop Sample</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Listen HD Voice</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Live Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Upcoming Calls */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">
              {currentLang === 'hi' ? 'आगामी शेड्यूल्स' : currentLang === 'mr' ? 'नियोजित कॉल्स' : 'Upcoming Calls'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {scheduledList.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>{currentLang === 'hi' ? 'सकारात्मक AI कतार में' : currentLang === 'mr' ? 'कॉल कतारमध्ये सज्ज' : 'Queued for delivery'}</span>
          </div>
        </div>

        {/* Card 2: Completed Calls */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">
              {currentLang === 'hi' ? 'सफल कॉल्स' : currentLang === 'mr' ? 'यशस्वी कॉल्स' : 'Completed Calls'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {completedList.length}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">
            100% Delivered
          </p>
        </div>

        {/* Card 3: WhatsApp/SMS Failover */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">
              {currentLang === 'hi' ? 'व्हाट्सएप फॉलबॅक' : currentLang === 'mr' ? 'व्हॉट्सॲप फॉलबॅक' : 'Failover Dispatched'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {fallbackList.length}
          </div>
          <p className="text-[11px] text-teal-400 mt-1 font-medium">
            Auto-Sent on Unanswered
          </p>
        </div>

        {/* Card 4: Security & Vault Sync */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">
                {currentLang === 'hi' ? 'सुरक्षा व सिंक' : currentLang === 'mr' ? 'सुरक्षा व सिंक' : 'Security & Sync'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AES-256 Vault Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono">
              {profile.lastSyncedAt ? new Date(profile.lastSyncedAt).toLocaleTimeString() : 'Synced'}
            </span>
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* SECTION 5: Next Scheduled Call Spotlight */}
      {nextReminder && (
        <div className="bg-slate-900/90 border border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">
                Next Upcoming AI Call
              </div>
              <h3 className="text-base font-black text-white">
                {nextReminder.contactName} ({nextReminder.phoneNumber})
              </h3>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-slate-300">🗓️ {new Date(nextReminder.scheduledDateTime).toLocaleString()}</span>
                <span aria-hidden="true">·</span>
                <span>{nextReminder.language === 'mr' ? 'मराठी' : nextReminder.language === 'hi' ? 'हिंदी' : 'English'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">Fallback Text Armed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenSimulatorForReminder(nextReminder);
              }}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{currentLang === 'hi' ? 'अभी टेस्ट कॉल करें' : currentLang === 'mr' ? 'आता टेस्ट कॉल करा' : 'Simulate Call Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 6: Owner & Super Admin Quick Notice */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>App Owner: Prem Jadhav ({adminSettings.ownerEmail})</span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage free user subscriptions, discount codes, UPI payments, and app theme settings.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenAdmin();
          }}
          className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
        >
          Open Owner Controls →
        </button>
      </div>

    </div>
  );
};
