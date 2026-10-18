import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Sparkles, 
  Volume2, 
  Check, 
  Zap,
  PhoneCall,
  CheckCircle2,
  Sliders,
  SlidersHorizontal,
  Flame,
  ArrowRight
} from 'lucide-react';
import { ScheduledReminder, LanguageCode, VoiceTone, FallbackOption } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/translations';
import { POSITIVE_SCRIPT_TEMPLATES, generatePositiveScript } from '../utils/positivePrompts';
import { soundEffects, speakText, stopSpeaking, AI_VOICE_PROFILES } from '../utils/speechVoice';

export interface SchedulePreset {
  title?: string;
  goal?: string;
  contactName?: string;
  phoneNumber?: string;
  dateOffsetMins?: number;
  templateId?: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReminder: (reminder: ScheduledReminder) => void;
  currentLang: LanguageCode;
  userName: string;
  userPhone?: string;
  initialPreset?: SchedulePreset | null;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSaveReminder,
  currentLang,
  userName,
  userPhone = '+91 98234 56789',
  initialPreset = null,
}) => {
  // Mode: 'easy' (3-step zero-friction) vs 'pro' (deep customization)
  const [modalMode, setModalMode] = useState<'easy' | 'pro'>('easy');

  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Default date to tomorrow at 10:00 AM
  const getInitialDateTime = (offsetMinutes = 1440) => {
    const d = new Date(Date.now() + offsetMinutes * 60000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [scheduledDateTime, setScheduledDateTime] = useState(() => getInitialDateTime(1440));
  const [language, setLanguage] = useState<LanguageCode>(currentLang);
  const [voiceId, setVoiceId] = useState<string>(
    currentLang === 'mr' ? 'meera_mr' : currentLang === 'en' ? 'ananya_en' : 'priya_hi'
  );
  const [voiceFilter, setVoiceFilter] = useState<'all' | 'hi' | 'mr' | 'en' | 'regional'>('all');
  const [auditioningVoiceId, setAuditioningVoiceId] = useState<string | null>(null);
  const [voiceTone, setVoiceTone] = useState<VoiceTone>('empathetic');
  const [callGoal, setCallGoal] = useState('');
  const [customScript, setCustomScript] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [fallbackOption, setFallbackOption] = useState<FallbackOption>('call_then_sms');
  const [retryOnNoAnswer, setRetryOnNoAnswer] = useState(true);
  const [maxRetries, setMaxRetries] = useState(2);
  const [retryIntervalMinutes, setRetryIntervalMinutes] = useState(5);
  
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Apply initial preset if provided
  useEffect(() => {
    if (initialPreset && isOpen) {
      if (initialPreset.contactName) setContactName(initialPreset.contactName);
      if (initialPreset.phoneNumber) setPhoneNumber(initialPreset.phoneNumber);
      if (initialPreset.goal) setCallGoal(initialPreset.goal);
      if (initialPreset.dateOffsetMins) {
        setScheduledDateTime(getInitialDateTime(initialPreset.dateOffsetMins));
      }
      if (initialPreset.templateId) {
        handleApplyTemplate(initialPreset.templateId, initialPreset.contactName, initialPreset.phoneNumber);
      }
    }
  }, [initialPreset, isOpen]);

  if (!isOpen) return null;

  // Handle quick auto-fill to call oneself
  const handleAutofillSelfTest = () => {
    soundEffects.playClick();
    setContactName(userName || 'Prem Jadhav');
    setPhoneNumber(userPhone || '+91 98234 56789');
    setScheduledDateTime(getInitialDateTime(2)); // in 2 minutes
    setCallGoal('Instant AI Self-Call Test');
    
    const selfScript = language === 'mr' 
      ? `नमस्कार ${userName || 'प्रेम'}, हा तुमचा AI चाचणी कॉल आहे. कॅलेंडर शेड्यूलिंग आणि व्हॉट्सॲप मेसेजिंग १००% व्यवस्थित काम करत आहे.`
      : language === 'hi'
      ? `नमस्ते ${userName || 'प्रेम'}, यह आपका AI टेस्ट कॉल है। कैलेंडर शेड्यूलिंग और व्हाट्सऐप संदेश १००% सक्रिय हैं।`
      : `Hello ${userName || 'Prem'}, this is your AI test call. Your automated calendar caller and WhatsApp failover are fully active!`;
    
    setCustomScript(selfScript);
    setWhatsappMessage(selfScript);
    setSmsMessage(selfScript);
    soundEffects.playSuccess();
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    soundEffects.playClick();
    if (newLang === 'hi') {
      setVoiceId('priya_hi');
    } else if (newLang === 'mr') {
      setVoiceId('meera_mr');
    } else if (newLang === 'en') {
      setVoiceId('ananya_en');
    } else if (newLang === 'gu') {
      setVoiceId('diya_gu');
    } else if (newLang === 'ta') {
      setVoiceId('kavya_ta');
    } else if (newLang === 'te') {
      setVoiceId('rajesh_te');
    }
  };

  const handleApplyTemplate = (templateId: string, customTargetName?: string, customPhone?: string) => {
    soundEffects.playClick();
    const tpl = POSITIVE_SCRIPT_TEMPLATES.find((item) => item.id === templateId);
    if (!tpl) return;

    const cName = customTargetName || contactName.trim() || (language === 'mr' ? 'प्रिय मित्र' : language === 'hi' ? 'प्रिय मित्र' : 'Friend');
    const sName = userName.trim() || 'Prem Jadhav';

    let script = '';
    let wa = '';
    let sms = '';

    if (language === 'mr') {
      script = tpl.scriptMr.replace(/\{name\}/g, cName).replace(/\{sender\}/g, sName);
      wa = tpl.whatsappMr.replace(/\{name\}/g, cName).replace(/\{sender\}/g, sName);
      sms = tpl.smsMr.replace(/\{name\}/g, cName).replace(/\{sender\}/g, sName);
    } else if (language === 'hi') {
      script = tpl.scriptHi.replace(/\{name\}/g, cName).replace(/\{sender\}/g, sName);
      wa = tpl.whatsappHi.replace(/\{name\}/g, cName).replace(/\{sender\}/g, sName);
      sms = tpl.smsHi.replace(/\{name\}/g, cName).replace(/\{sender\}/g, sName);
    } else {
      script = tpl.scriptEn.replace(/\{name\}/g, cName).replace(/\{sender\}/g, sName);
      wa = tpl.whatsappEn.replace(/\{name\}/g, cName).replace(/\{sender\}/g, sName);
      sms = tpl.smsEn.replace(/\{name\}/g, cName).replace(/\{sender\}/g, sName);
    }

    setCallGoal(language === 'mr' ? tpl.titleMr : language === 'hi' ? tpl.titleHi : tpl.title);
    setCustomScript(script);
    setWhatsappMessage(wa);
    setSmsMessage(sms);
  };

  const handleGenerateAiScript = () => {
    soundEffects.playClick();
    setIsGenerating(true);

    setTimeout(() => {
      const generated = generatePositiveScript(
        callGoal || 'महत्वपूर्ण स्मरणपत्र व सदिच्छा (Important positive update)',
        contactName,
        userName,
        language,
        voiceTone
      );
      setCustomScript(generated.script);
      setWhatsappMessage(generated.whatsapp);
      setSmsMessage(generated.sms);
      setIsGenerating(false);
      soundEffects.playSuccess();
    }, 350);
  };

  const handlePreviewVoice = () => {
    if (isPlayingPreview) {
      stopSpeaking();
      setIsPlayingPreview(false);
      return;
    }

    soundEffects.playClick();
    setIsPlayingPreview(true);
    speakText(
      customScript || (language === 'mr' ? 'नमस्कार! हा आपला AI व्हॉइस कॉल आहे.' : language === 'hi' ? 'नमस्ते! यह आपका AI वॉइस कॉल है।' : 'Hello! This is your AI voice call preview.'),
      language,
      voiceTone,
      () => {
        setIsPlayingPreview(false);
      },
      voiceId
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stopSpeaking();
    soundEffects.playSuccess();

    const newReminder: ScheduledReminder = {
      id: 'rem_' + Date.now(),
      contactName: contactName.trim() || 'Recipient',
      phoneNumber: phoneNumber.trim() || '+91 98765 00000',
      scheduledDateTime: new Date(scheduledDateTime).toISOString(),
      language,
      voiceId,
      voiceTone,
      callGoal: callGoal.trim() || 'Scheduled Reminder',
      customScript: customScript.trim() || 'Namaste, this is an automated positive reminder.',
      fallbackOption,
      whatsappMessage: whatsappMessage.trim() || 'Namaste! Missed our AI call? Here is the update on WhatsApp.',
      smsMessage: smsMessage.trim() || `AwaazAI: Gentle reminder from ${userName}: ${callGoal || 'Important update'}. Please call back.`,
      retryOnNoAnswer,
      maxRetries,
      retryIntervalMinutes,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };

    onSaveReminder(newReminder);
    onClose();
  };

  // Format scheduled calendar time for preview
  const scheduledDateObj = new Date(scheduledDateTime);
  const formattedScheduledHuman = !isNaN(scheduledDateObj.getTime())
    ? scheduledDateObj.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6 text-white">
        
        {/* Header with Mode Switch */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{currentLang === 'hi' ? 'AI कॉल व फॉलबॅक मेसेज शेड्यूल करें' : currentLang === 'mr' ? 'AI कॉल व फॉलबॅक मेसेज शेड्यूल करा' : 'Schedule AI Automated Call'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {currentLang === 'hi' ? 'तय तारीख व समय पर AI कॉल करेगा, न उठाने पर SMS/व्हाट्सएप भेजेगा' : currentLang === 'mr' ? 'नियोजित तारीख व वेळेवर AI कॉल करेल, न उचलल्यास SMS/व्हॉट्सॲप पाठवेल' : 'Calls at set date/time; auto-sends SMS & WhatsApp if unanswered'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Easy Mode vs Pro Mode segmented pill */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setModalMode('easy');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  modalMode === 'easy'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚡ Easy
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setModalMode('pro');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  modalMode === 'pro'
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚙️ Pro
              </button>
            </div>

            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Quick Presets Banner */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Quick Presets:</span>
              </span>
              <button
                type="button"
                onClick={handleAutofillSelfTest}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>⚡ Test Myself in 2 Mins</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                { id: 'pos_health', label: '🩺 Doctor Reminder' },
                { id: 'pos_meeting', label: '🤝 Business Meeting' },
                { id: 'pos_festive', label: '🎂 Birthday Wishes' },
                { id: 'pos_payment', label: '💰 Payment Follow-up' },
                { id: 'pos_family', label: '❤️ Family Check-in' },
              ].map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handleApplyTemplate(preset.id)}
                  className="whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 1: Contact Information */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Step 1: Who should the AI call?</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Rahul Sharma / Dr. Patil"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Calendar Date & Time */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Step 2: When should the AI call?</span>
              </span>
              {formattedScheduledHuman && (
                <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/30">
                  🗓️ {formattedScheduledHuman}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="datetime-local"
                  required
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-white font-mono cursor-pointer"
                />
              </div>

              {/* Quick Timing Shortcuts */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: '+2 Mins', mins: 2 },
                  { label: '+15 Mins', mins: 15 },
                  { label: '+1 Hour', mins: 60 },
                  { label: 'Tomorrow 10 AM', mins: 1440 },
                ].map((timing) => (
                  <button
                    type="button"
                    key={timing.label}
                    onClick={() => {
                      soundEffects.playClick();
                      setScheduledDateTime(getInitialDateTime(timing.mins));
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                  >
                    {timing.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: Voice Language & Speech Message */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Step 3: What should the AI say?
              </span>

              {/* Language Selection */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { code: 'hi', label: 'हिंदी' },
                  { code: 'mr', label: 'मराठी' },
                  { code: 'en', label: 'English' },
                ].map((l) => (
                  <button
                    type="button"
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code as LanguageCode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === l.code
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Call Purpose / Topic
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAiScript}
                  disabled={isGenerating}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Generating...' : 'Enhance with AI'}</span>
                </button>
              </div>
              <input
                type="text"
                value={callGoal}
                onChange={(e) => setCallGoal(e.target.value)}
                placeholder="e.g. Friendly reminder about project meeting tomorrow at 11 AM"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Exact Voice Message Script
                </label>
                <button
                  type="button"
                  onClick={handlePreviewVoice}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingPreview ? 'animate-pulse text-green-400' : ''}`} />
                  <span>{isPlayingPreview ? 'Stop Audio' : 'Preview Voice Call'}</span>
                </button>
              </div>
              <textarea
                required
                rows={3}
                value={customScript}
                onChange={(e) => setCustomScript(e.target.value)}
                placeholder="Namaste! This is an automated positive reminder..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Guaranteed Fallback Promise */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Automated WhatsApp & SMS Fallback:</strong> If the person doesn't pick up or is busy, the AI immediately delivers your message as a clean text message so nothing is missed.
            </div>
          </div>

          {/* PRO MODE EXTRA SETTINGS (Hidden in Easy Mode) */}
          {modalMode === 'pro' && (
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                <span>Pro Options: AI Voice Selection & Retries</span>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Choose AI Voice Actor
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AI_VOICE_PROFILES.map((voice) => {
                    const isSelected = voiceId === voice.id;
                    return (
                      <button
                        type="button"
                        key={voice.id}
                        onClick={() => {
                          soundEffects.playClick();
                          setVoiceId(voice.id);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-900/40 border-indigo-500 ring-1 ring-indigo-500'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{voice.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{voice.language}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{voice.personaTitle}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice Tone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Voice Tone
                  </label>
                  <select
                    value={voiceTone}
                    onChange={(e) => setVoiceTone(e.target.value as VoiceTone)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="empathetic">Empathetic & Warm</option>
                    <option value="professional">Professional & Formal</option>
                    <option value="friendly">Friendly & Casual</option>
                    <option value="respectful">Respectful & Traditional</option>
                    <option value="energetic">Energetic & Upbeat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fallback Channel
                  </label>
                  <select
                    value={fallbackOption}
                    onChange={(e) => setFallbackOption(e.target.value as FallbackOption)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="call_then_sms">Call → SMS Fallback</option>
                    <option value="call_then_whatsapp">Call → WhatsApp Fallback</option>
                    <option value="call_then_both">Call → Both WhatsApp & SMS</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Schedule Call</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
