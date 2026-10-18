import React, { useState } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  ShieldAlert, 
  Volume2, 
  Play, 
  Pause, 
  MessageSquare, 
  PhoneIncoming, 
  Sparkles,
  Trash2,
  Package,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Smartphone,
  PhoneCall,
  CheckCircle2,
  Copy,
  Check,
  Wifi
} from 'lucide-react';
import { ScreenedCall, EqualAiSettings, LanguageCode, AiVoiceProfile, UserProfile } from '../types';
import {
  soundEffects,
  speakText,
  stopSpeaking,
  getVoicesForLanguage,
  getSampleGreetingForVoice,
} from '../utils/speechVoice';

interface CallScreeningTabProps {
  currentLang: LanguageCode;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  screenedCalls: ScreenedCall[];
  equalAiSettings: EqualAiSettings;
  onUpdateSettings: (settings: EqualAiSettings) => void;
  onSimulateIncomingCall: (preset: Partial<ScreenedCall>) => void;
  onDeleteCallRecord: (id: string) => void;
}

type SimCarrier = 'jio' | 'airtel' | 'vi' | 'bsnl';

export const CallScreeningTab: React.FC<CallScreeningTabProps> = ({
  currentLang,
  profile,
  onUpdateProfile,
  screenedCalls,
  equalAiSettings,
  onUpdateSettings,
  onSimulateIncomingCall,
  onDeleteCallRecord,
}) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [expandedCallId, setExpandedCallId] = useState<string | null>(
    screenedCalls[0]?.id || null
  );

  // Mobile Number & SIM Connection State
  const [isSimSetupOpen, setIsSimSetupOpen] = useState(true);
  const [phoneInput, setPhoneInput] = useState(profile.phoneNumber || '+91 98234 56789');
  const [whatsappInput, setWhatsappInput] = useState(
    profile.whatsappNotificationNumber || profile.phoneNumber || '+91 98234 56789'
  );
  const [selectedCarrier, setSelectedCarrier] = useState<SimCarrier>('jio');
  const [numberSavedSuccess, setNumberSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const availableVoices = getVoicesForLanguage(currentLang);
  const activeVoiceId = equalAiSettings.selectedVoiceId || 'jarvis_ai';

  const cleanDigits = (num: string) => {
    const digits = num.replace(/\D/g, '');
    if (digits.length >= 10) {
      return digits.slice(-10);
    }
    return '9823456789';
  };

  const tenDigitNumber = cleanDigits(phoneInput);

  const getCarrierForwardingInfo = (carrier: SimCarrier, target10Digit: string) => {
    switch (carrier) {
      case 'jio':
        return {
          name: 'Jio 5G / True 4G',
          activateBusyCode: `*405*${target10Digit}`,
          activateNoAnswerCode: `*403*${target10Digit}`,
          deactivateCode: `*413`,
          note: 'Dial *403*Number on your Jio SIM to forward unanswered calls to AI.',
        };
      case 'airtel':
        return {
          name: 'Airtel 5G Plus',
          activateBusyCode: `**67*+91${target10Digit}#`,
          activateNoAnswerCode: `**61*+91${target10Digit}#`,
          deactivateCode: `##002#`,
          note: 'Dial **61*+91Number# on Airtel to let AI pick up when you don’t answer.',
        };
      case 'vi':
        return {
          name: 'Vi (Vodafone Idea)',
          activateBusyCode: `**67*+91${target10Digit}#`,
          activateNoAnswerCode: `**61*+91${target10Digit}#`,
          deactivateCode: `##002#`,
          note: 'Standard GSM Conditional Call Forwarding for Vi numbers.',
        };
      case 'bsnl':
        return {
          name: 'BSNL Mobile',
          activateBusyCode: `**67*${target10Digit}#`,
          activateNoAnswerCode: `**61*${target10Digit}#`,
          deactivateCode: `##002#`,
          note: 'Dial **61*Number# from your BSNL dialer to enable AI pickup.',
        };
    }
  };

  const carrierInfo = getCarrierForwardingInfo(selectedCarrier, tenDigitNumber);

  const handleSaveMobileConnection = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playSuccess();
    const updated: UserProfile = {
      ...profile,
      phoneNumber: phoneInput.trim(),
      whatsappNotificationNumber: whatsappInput.trim() || phoneInput.trim(),
      lastSyncedAt: new Date().toISOString(),
    };
    onUpdateProfile(updated);
    setNumberSavedSuccess(true);
    setTimeout(() => setNumberSavedSuccess(false), 3000);
  };

  const handleCopyMmi = (code: string) => {
    soundEffects.playClick();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectAndPreviewVoice = (voice: AiVoiceProfile) => {
    onUpdateSettings({
      ...equalAiSettings,
      selectedVoiceId: voice.id,
    });

    if (previewingVoiceId === voice.id) {
      stopSpeaking();
      setPreviewingVoiceId(null);
      return;
    }

    setPreviewingVoiceId(voice.id);
    const sample = getSampleGreetingForVoice(voice, currentLang);
    speakText(
      sample,
      currentLang,
      voice.tone,
      () => {
        setPreviewingVoiceId(null);
      },
      voice.id
    );
  };

  const handleToggleAudio = (call: ScreenedCall) => {
    if (playingAudioId === call.id) {
      stopSpeaking();
      setPlayingAudioId(null);
      return;
    }

    soundEffects.playClick();
    setPlayingAudioId(call.id);

    const textToRead = `${call.callerName}. ${call.aiSummary}`;
    speakText(
      textToRead,
      call.language,
      'professional',
      () => {
        setPlayingAudioId(null);
      },
      activeVoiceId
    );
  };

  const handlePresetSimulation = (type: 'spam' | 'vip' | 'delivery' | 'unknown') => {
    soundEffects.playClick();
    if (type === 'spam') {
      onSimulateIncomingCall({
        callerName:
          currentLang === 'mr'
            ? 'बजाज फायनान्स लोन (स्पॅम)'
            : currentLang === 'hi'
            ? 'बजाज फाइनेंस लोन (स्पैम)'
            : 'Bajaj Personal Loan Spam',
        callerNumber: '+91 140 982 1102',
        callerType: 'fraud_scam',
        spamScore: 94,
        language: currentLang,
      });
    } else if (type === 'vip') {
      onSimulateIncomingCall({
        callerName:
          currentLang === 'mr'
            ? 'डॉ. विकास देशमुख (VIP)'
            : currentLang === 'hi'
            ? 'डॉ. विकास देशमुख (VIP)'
            : 'Dr. Vikas Deshmukh',
        callerNumber: '+91 98220 12345',
        callerType: 'vip',
        spamScore: 3,
        language: currentLang,
      });
    } else if (type === 'delivery') {
      onSimulateIncomingCall({
        callerName: 'Amazon Express Delivery',
        callerNumber: '+91 91520 88990',
        callerType: 'delivery',
        spamScore: 6,
        language: currentLang,
      });
    } else {
      onSimulateIncomingCall({
        callerName:
          currentLang === 'mr'
            ? 'अनोळखी कॉलर (मुंबई)'
            : currentLang === 'hi'
            ? 'अनजान कॉलर (मुंबई)'
            : 'Unknown Caller (Mumbai)',
        callerNumber: '+91 98901 44510',
        callerType: 'suspected_spam',
        spamScore: 35,
        language: currentLang,
      });
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Equal AI Receptionist Hero Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-emerald-400">
              Equal AI Assistant · {activeVoiceId === 'jarvis_ai' ? 'J.A.R.V.I.S. Stark Mode' : 'Active Shield'}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentLang === 'hi'
                ? 'J.A.R.V.I.S. व AI पहले कॉल उठाएगा और लाइव चैट दिखाएगा'
                : currentLang === 'mr'
                ? 'J.A.R.V.I.S. व AI प्रथम कॉल स्वीकारेल आणि लाईव्ह चॅट दाखवेल'
                : 'J.A.R.V.I.S. & Equal AI Screen Calls in Real Time'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentLang === 'hi'
                ? 'आयरन मैन के J.A.R.V.I.S. या नेचुरल HD भारतीय आवाज़ में कॉल रिसीव करें और लाइव ट्रांसक्रिप्ट देखें।'
                : currentLang === 'mr'
                ? 'आयर्न मॅनच्या J.A.R.V.I.S. किंवा नैसर्गिक HD आवाजात कॉल स्वीकारून लाईव्ह चॅट पहा.'
                : 'Answer incoming calls with Iron Man’s J.A.R.V.I.S. or Studio HD Indian voices and watch the live transcript.'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        {/* 1-Tap Incoming Call Simulation Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePresetSimulation('delivery')}
            className="min-h-[48px] px-3 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-[0.98]"
          >
            <Package className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Delivery Call</div>
              <div className="text-[10px] text-amber-300/80 truncate">Amazon Parcel Gate</div>
            </div>
          </button>

          <button
            onClick={() => handlePresetSimulation('spam')}
            className="min-h-[48px] px-3 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200 flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-[0.98]"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Loan Spam</div>
              <div className="text-[10px] text-rose-300/80 truncate">94% Risk · Auto-Block</div>
            </div>
          </button>

          <button
            onClick={() => handlePresetSimulation('vip')}
            className="min-h-[48px] px-3 py-2.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-[0.98]"
          >
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">VIP Doctor</div>
              <div className="text-[10px] text-emerald-300/80 truncate">Verified Contact</div>
            </div>
          </button>

          <button
            onClick={() => handlePresetSimulation('unknown')}
            className="min-h-[48px] px-3 py-2.5 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-[0.98]"
          >
            <PhoneIncoming className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Unknown Caller</div>
              <div className="text-[10px] text-indigo-300/80 truncate">Live AI Screening</div>
            </div>
          </button>
        </div>
      </div>

      {/* CONNECT MOBILE NUMBER & SIM CALL FORWARDING HUB */}
      <div className="bg-slate-900/95 border border-emerald-500/35 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-lg shadow-emerald-950/20">
        <div
          onClick={() => setIsSimSetupOpen(!isSimSetupOpen)}
          className="flex items-center justify-between gap-2 cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white truncate">
                  {currentLang === 'hi'
                    ? 'मोबाइल नंबर और SIM कनेक्ट करें'
                    : currentLang === 'mr'
                    ? 'मोबाईल नंबर आणि SIM कनेक्ट करा'
                    : 'Connect Mobile Number & SIM Card'}
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                  ● LINKED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                {profile.phoneNumber} · Jio / Airtel / Vi / BSNL
              </p>
            </div>
          </div>
          <div className="text-slate-400 p-1 shrink-0">
            {isSimSetupOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {isSimSetupOpen && (
          <div className="space-y-3.5 pt-2 border-t border-slate-800/80 animate-in fade-in">
            {numberSavedSuccess && (
              <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-2.5 flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Mobile number & WhatsApp alert number connected!
                </span>
              </div>
            )}

            {/* Step 1: Link Mobile & WhatsApp Number */}
            <form onSubmit={handleSaveMobileConnection} className="space-y-2.5">
              <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                <span>STEP 1: Enter Your Mobile & WhatsApp Number</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    Primary Mobile Number (SIM)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 98234 56789"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    WhatsApp Alert Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    placeholder="+91 98234 56789"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save & Connect Number</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    onSimulateIncomingCall({
                      callerName: `Test Call → ${phoneInput}`,
                      callerNumber: phoneInput,
                      callerType: 'vip',
                      spamScore: 2,
                      language: currentLang,
                    });
                  }}
                  className="min-h-[40px] px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Test AI Call</span>
                </button>
              </div>
            </form>

            {/* Step 2: SIM Call Forwarding (Jio / Airtel / Vi / BSNL) */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-amber-400" />
                  <span>STEP 2: Activate SIM Call Forwarding to AI</span>
                </span>
              </div>

              {/* Carrier Tabs */}
              <div className="grid grid-cols-4 gap-1.5">
                {(['jio', 'airtel', 'vi', 'bsnl'] as SimCarrier[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedCarrier(c);
                    }}
                    className={`py-1.5 rounded-xl text-[11px] font-bold uppercase border transition-all cursor-pointer ${
                      selectedCarrier === c
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {carrierInfo.note}
              </p>

              <div className="space-y-1.5">
                {/* Unanswered Forwarding Code */}
                <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2">
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400">
                      When Unanswered (AI Picks Up)
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-400 truncate">
                      {carrierInfo.activateNoAnswerCode}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyMmi(carrierInfo.activateNoAnswerCode)}
                      className="min-h-[34px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode === carrierInfo.activateNoAnswerCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy</span>
                    </button>
                    <a
                      href={`tel:${encodeURIComponent(carrierInfo.activateNoAnswerCode)}`}
                      className="min-h-[34px] px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Dial</span>
                    </a>
                  </div>
                </div>

                {/* Deactivate Code */}
                <div className="flex items-center justify-between gap-2 bg-slate-900/60 border border-slate-800/70 rounded-xl px-2.5 py-1.5">
                  <span className="text-[10px] text-slate-400">
                    Turn Off Forwarding Anytime: <strong className="text-rose-300 font-mono">{carrierInfo.deactivateCode}</strong>
                  </span>
                  <a
                    href={`tel:${encodeURIComponent(carrierInfo.deactivateCode)}`}
                    className="text-[10px] font-bold text-rose-400 hover:underline"
                  >
                    Dial Reset
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* J.A.R.V.I.S. & Neural HD Voice Selector Studio */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>AI Receptionist Voice (J.A.R.V.I.S. & Neural HD)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Tap any voice to activate & hear a live HD voice sample
            </p>
          </div>
          {previewingVoiceId && (
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setPreviewingVoiceId(null);
              }}
              className="px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold cursor-pointer"
            >
              Stop Audio
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {availableVoices.map((voice) => {
            const isSelected = activeVoiceId === voice.id;
            const isPlayingThis = previewingVoiceId === voice.id;
            const isStark = voice.isStarkAi;

            return (
              <button
                key={voice.id}
                type="button"
                onClick={() => handleSelectAndPreviewVoice(voice)}
                className={`min-h-[60px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? isStark
                      ? 'bg-cyan-950/50 border-cyan-400/60 shadow-md shadow-cyan-950/50'
                      : 'bg-indigo-950/50 border-indigo-400/60 shadow-md shadow-indigo-950/50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {voice.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {isStark ? 'Stark Neural HD' : voice.accent} · {voice.gender === 'male' ? 'Male' : 'Female'}
                  </p>
                </div>

                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isPlayingThis
                      ? 'bg-amber-500 text-slate-950'
                      : isSelected
                      ? isStark
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Equal AI Receptionist Toggles (2x2 Thumb-Friendly Grid) */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onUpdateSettings({
              ...equalAiSettings,
              aiFirstResponseEnabled: !equalAiSettings.aiFirstResponseEnabled,
            });
          }}
          className={`min-h-[64px] p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            equalAiSettings.aiFirstResponseEnabled
              ? 'bg-slate-900 border-indigo-500/40'
              : 'bg-slate-900/50 border-slate-800 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {equalAiSettings.aiFirstResponseEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xs font-bold text-white">AI First Pickup</div>
            <div className="text-[10px] text-slate-400 truncate">Answers in 2 rings</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onUpdateSettings({
              ...equalAiSettings,
              autoBlockFraud: !equalAiSettings.autoBlockFraud,
            });
          }}
          className={`min-h-[64px] p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            equalAiSettings.autoBlockFraud
              ? 'bg-slate-900 border-rose-500/40'
              : 'bg-slate-900/50 border-slate-800 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-[10px] font-mono font-bold text-rose-400">
              {equalAiSettings.autoBlockFraud ? 'BLOCK' : 'OFF'}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xs font-bold text-white">Auto-Block Spam</div>
            <div className="text-[10px] text-slate-400 truncate">Rejects 80%+ risk</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onUpdateSettings({
              ...equalAiSettings,
              silentCompanyTelemarketers: !equalAiSettings.silentCompanyTelemarketers,
            });
          }}
          className={`min-h-[64px] p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            equalAiSettings.silentCompanyTelemarketers
              ? 'bg-slate-900 border-amber-500/40'
              : 'bg-slate-900/50 border-slate-800 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono font-bold text-amber-400">
              {equalAiSettings.silentCompanyTelemarketers ? 'MUTED' : 'OFF'}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xs font-bold text-white">Silence Promo</div>
            <div className="text-[10px] text-slate-400 truncate">Zero ring for ads</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onUpdateSettings({
              ...equalAiSettings,
              sendSummaryToWhatsApp: !equalAiSettings.sendSummaryToWhatsApp,
            });
          }}
          className={`min-h-[64px] p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            equalAiSettings.sendSummaryToWhatsApp
              ? 'bg-slate-900 border-emerald-500/40'
              : 'bg-slate-900/50 border-slate-800 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {equalAiSettings.sendSummaryToWhatsApp ? 'SYNC' : 'OFF'}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xs font-bold text-white">WhatsApp Notes</div>
            <div className="text-[10px] text-slate-400 truncate">Instant call summary</div>
          </div>
        </button>
      </div>

      {/* Screened Calls & Live Transcript Feed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Screened Calls</h3>
            <p className="text-[11px] text-slate-400">
              Tap any call to read the AI conversation transcript
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {screenedCalls.length} calls
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {screenedCalls.map((call) => {
            const isBlocked = call.status === 'blocked';
            const isPlaying = playingAudioId === call.id;
            const isExpanded = expandedCallId === call.id;

            return (
              <div key={call.id} className="py-3 first:pt-1 last:pb-0 space-y-2.5">
                <div
                  onClick={() => setExpandedCallId(isExpanded ? null : call.id)}
                  className="flex items-center justify-between gap-3 cursor-pointer min-h-[52px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isBlocked
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {isBlocked ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{call.callerName}</h4>
                      <p className="text-[11px] text-slate-400 font-mono tabular-nums truncate">
                        {call.callerNumber} ·{' '}
                        <span className={isBlocked ? 'text-rose-400' : 'text-emerald-400'}>
                          {isBlocked ? `Blocked (${call.spamScore}% Spam)` : 'Screened'}
                        </span>{' '}
                        · {call.recordingDurationSec}s
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAudio(call);
                      }}
                      className={`min-h-[38px] min-w-[38px] px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
                      }`}
                      title="Listen to AI call summary"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <div className="text-slate-500 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pl-2 sm:pl-12 space-y-2.5 animate-in fade-in">
                    <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 text-xs text-slate-300 space-y-1">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Equal AI Summary</span>
                      </div>
                      <p className="leading-relaxed">{call.aiSummary}</p>
                    </div>

                    {call.screeningTranscript && call.screeningTranscript.length > 0 && (
                      <div className="bg-slate-950/50 border border-slate-800/70 rounded-2xl p-3 space-y-2">
                        <div className="text-[10px] font-semibold text-slate-400">
                          Conversation Transcript
                        </div>
                        <div className="space-y-2">
                          {call.screeningTranscript.map((t) => (
                            <div
                              key={t.id}
                              className={`flex flex-col ${
                                t.speaker === 'caller' ? 'items-start' : 'items-end'
                              }`}
                            >
                              <span className="text-[10px] text-slate-500 font-mono mb-0.5">
                                {t.speaker === 'caller' ? 'Caller' : 'Equal AI'} · {t.time}
                              </span>
                              <div
                                className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-snug ${
                                  t.speaker === 'caller'
                                    ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                                    : 'bg-indigo-600/90 text-white rounded-tr-sm'
                                }`}
                              >
                                {t.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `AwaazAI Call Summary: ${call.callerName} (${call.callerNumber}) - ${call.aiSummary}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[36px] px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Share to WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => onDeleteCallRecord(call.id)}
                        className="min-h-[36px] px-3 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
