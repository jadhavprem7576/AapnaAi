import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Phone, 
  PhoneOff, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Send, 
  UserCheck, 
  Bot,
  PhoneIncoming,
  Package,
  Mic,
  CheckCircle2
} from 'lucide-react';
import { ScreenedCall, LanguageCode, EqualAiSettings } from '../types';
import { soundEffects, speakText, stopSpeaking } from '../utils/speechVoice';

interface LiveCallScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallFinished: (screenedCall: ScreenedCall) => void;
  currentLang: LanguageCode;
  equalAiSettings: EqualAiSettings;
  incomingCallPreset?: Partial<ScreenedCall>;
}

export const LiveCallScreeningModal: React.FC<LiveCallScreeningModalProps> = ({
  isOpen,
  onClose,
  onCallFinished,
  currentLang,
  equalAiSettings,
  incomingCallPreset,
}) => {
  const [stage, setStage] = useState<'incoming' | 'live_screening' | 'user_taken' | 'blocked' | 'completed'>('incoming');
  const [messages, setMessages] = useState<Array<{ id: string; speaker: 'caller' | 'ai_assistant' | 'user'; text: string; time: string }>>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isCallerSpeaking, setIsCallerSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [customInstruction, setCustomInstruction] = useState('');
  const [customScenario, setCustomScenario] = useState<Partial<ScreenedCall> | undefined>(incomingCallPreset);
  const [activeVoiceId, setActiveVoiceId] = useState<string>(equalAiSettings.selectedVoiceId || 'jarvis_ai');

  const timerRef = useRef<number | null>(null);
  const autoScreenTimeoutRef = useRef<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCustomScenario(incomingCallPreset);
  }, [incomingCallPreset]);

  useEffect(() => {
    if (equalAiSettings.selectedVoiceId) {
      setActiveVoiceId(equalAiSettings.selectedVoiceId);
    }
  }, [equalAiSettings.selectedVoiceId]);

  const activeCaller = {
    name:
      customScenario?.callerName ||
      (currentLang === 'mr'
        ? 'बजाज फायनान्स लोन (संशयित स्पॅम)'
        : currentLang === 'hi'
        ? 'बजाज फाइनेंस लोन (संभावित स्पैम)'
        : 'Bajaj Finance Telemarketing'),
    number: customScenario?.callerNumber || '+91 140 982 1102',
    callerType: customScenario?.callerType || 'fraud_scam',
    spamScore: customScenario?.spamScore ?? 92,
    language: customScenario?.language || currentLang,
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiSpeaking, isCallerSpeaking]);

  useEffect(() => {
    if (isOpen) {
      startIncomingCallFlow();
    } else {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen, customScenario]);

  const startIncomingCallFlow = () => {
    cleanup();
    setStage('incoming');
    setMessages([]);
    setCallDuration(0);
    soundEffects.playRing();

    if (equalAiSettings.aiFirstResponseEnabled) {
      autoScreenTimeoutRef.current = window.setTimeout(() => {
        handleAiAutoAnswer();
      }, 2200);
    }
  };

  const cleanup = () => {
    soundEffects.stopRing();
    stopSpeaking();
    setIsAiSpeaking(false);
    setIsCallerSpeaking(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoScreenTimeoutRef.current) clearTimeout(autoScreenTimeoutRef.current);
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleAiAutoAnswer = () => {
    soundEffects.stopRing();
    soundEffects.playSuccess();
    setStage('live_screening');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    let initialAiGreeting = '';
    const isJarvis = activeVoiceId === 'jarvis_ai';
    const isFriday = activeVoiceId === 'friday_ai';

    if (activeCaller.language === 'mr') {
      initialAiGreeting = isJarvis
        ? 'नमस्कार! मी जार्विस बोलत आहे, प्रेम जाधव सर यांची पर्सनल AI सिस्टिम. कृपया आपले नाव आणि कॉल करण्याचे कारण सांगावे.'
        : isFriday
        ? 'नमस्कार! मी फ्रायडे बोलत आहे, प्रेम जाधव यांची AI असिस्टंट. आपण कोण बोलत आहात?'
        : 'नमस्कार! मी प्रेम जाधव यांचा Equal AI असिस्टंट बोलत आहे. आपण कोण बोलत आहात आणि कशासाठी फोन केला आहे?';
    } else if (activeCaller.language === 'hi') {
      initialAiGreeting = isJarvis
        ? 'नमस्कार! मैं जार्विस बोल रहा हूँ, प्रेम जाधव सर का पर्सनल AI सिस्टम। कृपया अपना परिचय और कॉल करने का कारण बताएं।'
        : isFriday
        ? 'नमस्ते! मैं फ्राइडे बोल रही हूँ, प्रेम जाधव जी की AI असिस्टेंट। कृपया बताएं आप कौन बोल रहे हैं?'
        : 'नमस्ते! मैं प्रेम जाधव जी का Equal AI असिस्टेंट बोल रहा हूँ। कृपया बताएं आप कौन बोल रहे हैं और किस काम से कॉल किया है?';
    } else {
      initialAiGreeting = isJarvis
        ? 'Good day. I am J.A.R.V.I.S., Mr. Prem Jadhav’s personal AI system. Please state your identity and the purpose of this transmission.'
        : isFriday
        ? 'Hello! F.R.I.D.A.Y. online for Prem Jadhav. Who is calling and how can I direct your message?'
        : "Hello! I'm Prem Jadhav's Equal AI Assistant screening this call. Please state your name and reason for calling.";
    }

    const greetingMsg = {
      id: 'm_' + Date.now(),
      speaker: 'ai_assistant' as const,
      text: initialAiGreeting,
      time: formatTime(),
    };
    setMessages([greetingMsg]);
    setIsAiSpeaking(true);

    if (!isMuted) {
      speakText(
        initialAiGreeting,
        activeCaller.language,
        'professional',
        () => {
          setIsAiSpeaking(false);
          simulateCallerDialogue();
        },
        activeVoiceId
      );
    } else {
      setTimeout(() => {
        setIsAiSpeaking(false);
        simulateCallerDialogue();
      }, 1500);
    }
  };

  const simulateCallerDialogue = () => {
    setIsCallerSpeaking(true);
    setTimeout(() => {
      setIsCallerSpeaking(false);
      let callerReply = '';

      if (activeCaller.callerType === 'delivery') {
        callerReply =
          activeCaller.language === 'mr'
            ? 'सर, मी Amazon डिलिव्हरी बॉय बोलतोय. तुमचे पार्सल आले आहे, गेटवर ठेवू का?'
            : activeCaller.language === 'hi'
            ? 'सर, मैं Amazon डिलीवरी एजेंट बोल रहा हूँ। आपका पार्सल सोसाइटी गेट पर आया है, कहाँ डिलीवर करूँ?'
            : 'Sir, I am calling from Amazon Express Delivery. I am at your main gate with your package.';
      } else if (activeCaller.callerType === 'fraud_scam' || activeCaller.callerType === 'telemarketer') {
        callerReply =
          activeCaller.language === 'mr'
            ? 'सर, आम्ही बजाज फायनान्स कडून बोलत आहोत. आपल्या नंबरवर १५ लाख रुपयांचे पर्सनल लोन मंजूर झाले आहे, फक्त OTP सांगा!'
            : activeCaller.language === 'hi'
            ? 'सर, हम बैंक लोन डिपार्टमेंट से बात कर रहे हैं। आपके लिए बिना किसी डॉक्यूमेंट्स के 10 लाख का पर्सनल लोन 0% ब्याज पर ऑफर है!'
            : 'Hello sir, calling from Financial Services regarding a pre-approved 10 Lakh personal loan offer valid only for today!';
      } else {
        callerReply =
          activeCaller.language === 'mr'
            ? 'नमस्कार, मी डॉ. विकास देशमुख बोलतोय. उद्याच्या अपॉइंटमेंट व रिपोर्ट्स संदर्भात प्रेम यांच्याशी बोलायचे होते.'
            : activeCaller.language === 'hi'
            ? 'नमस्ते, मैं डॉ. विकास देशमुख बात कर रहा हूँ। कल की मीटिंग और प्रोजेक्ट अपडेट पर प्रेम जी से बात करनी थी।'
            : 'Hi, this is Dr. Vikas Deshmukh calling regarding tomorrow’s scheduled appointment with Prem.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'c_' + Date.now(),
          speaker: 'caller',
          text: callerReply,
          time: formatTime(),
        },
      ]);

      if (equalAiSettings.autoBlockFraud && (activeCaller.callerType === 'fraud_scam' || activeCaller.spamScore > 80)) {
        setTimeout(() => {
          handleBlockAndHangup(true);
        }, 2200);
      }
    }, 1600);
  };

  const handleInstructAi = (instruction: string) => {
    if (!instruction.trim()) return;
    soundEffects.playClick();

    setMessages((prev) => [
      ...prev,
      {
        id: 'u_' + Date.now(),
        speaker: 'user',
        text: instruction,
        time: formatTime(),
      },
    ]);
    setCustomInstruction('');
    setIsAiSpeaking(true);

    setTimeout(() => {
      let aiResponseToCaller = '';
      const lower = instruction.toLowerCase();

      if (lower.includes('door') || lower.includes('gate') || lower.includes('parcel') || lower.includes('package')) {
        aiResponseToCaller =
          activeCaller.language === 'mr'
            ? 'प्रेमजींनी सांगितले आहे की कृपया पार्सल सिक्युरिटी गार्डकडे किंवा दरवाजाजवळ ठेवावे. धन्यवाद!'
            : activeCaller.language === 'hi'
            ? 'प्रेम जी ने निर्देश दिया है कि कृपया पार्सल दरवाजे पर या सिक्योरिटी गार्ड के पास रख दें। धन्यवाद!'
            : 'Prem says please leave the package safely at the front door or with building security. Thank you!';
      } else if (lower.includes('meeting') || lower.includes('whatsapp')) {
        aiResponseToCaller =
          activeCaller.language === 'mr'
            ? 'प्रेमजी सध्या महत्त्वाच्या मीटिंगमध्ये आहेत. कृपया आपला निरोप व्हॉट्सॲपवर पाठवावा.'
            : activeCaller.language === 'hi'
            ? 'प्रेम जी इस समय एक महत्वपूर्ण बैठक में हैं। कृपया अपना संदेश उनके व्हाट्सएप पर भेज दें।'
            : 'Prem is currently in a meeting. Please send the details on WhatsApp and he will reply shortly.';
      } else if (lower.includes('who') || lower.includes('purpose') || lower.includes('details')) {
        aiResponseToCaller =
          activeCaller.language === 'mr'
            ? 'कृपया आपले पूर्ण नाव आणि कामाचे स्वरूप स्पष्टपणे सांगावे.'
            : activeCaller.language === 'hi'
            ? 'कृपया अपना पूरा नाम और कॉल करने का कारण विस्तार से बताएं।'
            : 'Could you please confirm your full name and share more details about why you are calling?';
      } else if (lower.includes('later') || lower.includes('hours') || lower.includes('callback')) {
        aiResponseToCaller =
          activeCaller.language === 'mr'
            ? 'प्रेमजी तुम्हाला २ तासांनंतर स्वतःहून फोन करतील. धन्यवाद!'
            : activeCaller.language === 'hi'
            ? 'प्रेम जी आपको थोड़ी देर बाद स्वयं कॉल बैक करेंगे। धन्यवाद!'
            : 'Prem will call you back in about 2 hours. Thank you for your patience!';
      } else {
        aiResponseToCaller =
          activeCaller.language === 'mr'
            ? `प्रेमजींचा निरोप: "${instruction}". धन्यवाद!`
            : activeCaller.language === 'hi'
            ? `प्रेम जी का संदेश: "${instruction}"। धन्यवाद!`
            : `Message from Prem: "${instruction}". Thank you!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          speaker: 'ai_assistant',
          text: aiResponseToCaller,
          time: formatTime(),
        },
      ]);

      if (!isMuted) {
        speakText(
          aiResponseToCaller,
          activeCaller.language,
          'respectful',
          () => {
            setIsAiSpeaking(false);
          },
          activeVoiceId
        );
      } else {
        setTimeout(() => setIsAiSpeaking(false), 1200);
      }
    }, 500);
  };

  const handleBlockAndHangup = (isAutoBlocked = false) => {
    soundEffects.playSuccess();
    cleanup();
    setStage('blocked');

    const blockMsg =
      activeCaller.language === 'mr'
        ? 'हा नंबर स्पॅम म्हणून ब्लॉक केला आहे. अनधिकृत कॉल्स डिस्कनेक्ट केले जात आहेत.'
        : activeCaller.language === 'hi'
        ? 'यह नंबर स्पैम लिस्ट में दर्ज कर दिया गया है। कॉल डिस्कनेक्ट की जा रही है।'
        : 'Security protocol engaged. This number has been flagged as Spam by J.A.R.V.I.S. and Equal AI. Disconnecting transmission.';

    if (!isMuted) {
      speakText(blockMsg, activeCaller.language, 'professional', undefined, activeVoiceId);
    }

    const screened: ScreenedCall = {
      id: 'sc_' + Date.now(),
      callerName: activeCaller.name,
      callerNumber: activeCaller.number,
      callerType: activeCaller.callerType,
      spamScore: activeCaller.spamScore,
      status: 'blocked',
      actionTaken: isAutoBlocked ? 'auto_blocked' : 'silenced',
      recordingDurationSec: callDuration || 12,
      language: activeCaller.language,
      timestamp: new Date().toISOString(),
      hasAudioRecording: true,
      aiSummary: `${activeCaller.name} flagged at ${activeCaller.spamScore}% spam risk. Equal AI screened and terminated the call automatically.`,
      screeningTranscript: messages,
    };

    onCallFinished(screened);
  };

  const handleTakeOverCall = () => {
    soundEffects.playSuccess();
    stopSpeaking();
    setIsAiSpeaking(false);
    setStage('user_taken');
  };

  const handleFinishScreening = () => {
    cleanup();
    setStage('completed');

    const screened: ScreenedCall = {
      id: 'sc_' + Date.now(),
      callerName: activeCaller.name,
      callerNumber: activeCaller.number,
      callerType: activeCaller.callerType,
      spamScore: activeCaller.spamScore,
      status: 'completed',
      actionTaken: 'forwarded_whatsapp',
      recordingDurationSec: callDuration || 24,
      language: activeCaller.language,
      timestamp: new Date().toISOString(),
      hasAudioRecording: true,
      aiSummary: `Equal AI screened ${activeCaller.name}. Full transcript & voice note saved and dispatched to WhatsApp.`,
      screeningTranscript: messages,
    };

    onCallFinished(screened);
  };

  const handleSwitchLiveScenario = (type: 'delivery' | 'spam' | 'vip') => {
    soundEffects.playClick();
    if (type === 'delivery') {
      setCustomScenario({
        callerName: 'Amazon Express Delivery',
        callerNumber: '+91 91520 88990',
        callerType: 'delivery',
        spamScore: 6,
        language: currentLang,
      });
    } else if (type === 'spam') {
      setCustomScenario({
        callerName: currentLang === 'mr' ? 'बजाज फायनान्स लोन (स्पॅम)' : currentLang === 'hi' ? 'बजाज फाइनेंस लोन (स्पैम)' : 'Bajaj Personal Loan Spam',
        callerNumber: '+91 140 982 1102',
        callerType: 'fraud_scam',
        spamScore: 95,
        language: currentLang,
      });
    } else {
      setCustomScenario({
        callerName: currentLang === 'mr' ? 'डॉ. विकास देशमुख (VIP)' : currentLang === 'hi' ? 'डॉ. विकास देशमुख (VIP)' : 'Dr. Vikas Deshmukh',
        callerNumber: '+91 98220 12345',
        callerType: 'vip',
        spamScore: 2,
        language: currentLang,
      });
    }
  };

  if (!isOpen) return null;

  const isHighSpam = activeCaller.spamScore > 70;
  const isDelivery = activeCaller.callerType === 'delivery';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
      {/* Native Mobile Call Screen Container */}
      <div className="relative w-full h-full sm:h-[760px] sm:max-h-[92vh] sm:max-w-[412px] bg-[#070b14] sm:border sm:border-slate-800 sm:rounded-[40px] shadow-2xl overflow-hidden text-white flex flex-col justify-between">
        
        {/* Top Ambient Caller Status Glow */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-56 opacity-35 blur-3xl transition-colors duration-500 ${
            isHighSpam
              ? 'bg-gradient-to-b from-rose-600 via-rose-900/40 to-transparent'
              : isDelivery
              ? 'bg-gradient-to-b from-amber-500 via-amber-900/30 to-transparent'
              : 'bg-gradient-to-b from-emerald-500 via-indigo-900/40 to-transparent'
          }`}
        />

        {/* Top Bar: Equal AI Call Shield Header + Scenario Switcher */}
        <div className="relative z-10 px-4 pt-3 pb-2.5 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white tracking-tight block leading-none">
                  {activeVoiceId === 'jarvis_ai'
                    ? 'J.A.R.V.I.S. · Stark Call Shield'
                    : activeVoiceId === 'friday_ai'
                    ? 'F.R.I.D.A.Y. · Tactical AI'
                    : 'Equal AI · Neural HD'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Live Receptionist · {activeCaller.language.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick J.A.R.V.I.S. / Voice Toggle */}
              <button
                onClick={() => {
                  const next =
                    activeVoiceId === 'jarvis_ai'
                      ? 'friday_ai'
                      : activeVoiceId === 'friday_ai'
                      ? activeCaller.language === 'mr'
                        ? 'meera_mr'
                        : activeCaller.language === 'hi'
                        ? 'priya_hi'
                        : 'ananya_en'
                      : 'jarvis_ai';
                  setActiveVoiceId(next);
                  soundEffects.playJarvisHud();
                }}
                className="min-h-[34px] px-2.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold cursor-pointer whitespace-nowrap"
                title="Switch AI Voice (J.A.R.V.I.S. / F.R.I.D.A.Y. / Indian HD)"
              >
                {activeVoiceId === 'jarvis_ai'
                  ? 'Voice: J.A.R.V.I.S.'
                  : activeVoiceId === 'friday_ai'
                  ? 'Voice: F.R.I.D.A.Y.'
                  : 'Voice: Indian HD'}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="min-h-[36px] min-w-[36px] rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={() => {
                  cleanup();
                  onClose();
                }}
                className="min-h-[36px] min-w-[36px] rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                title="Close call screen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1-Tap Caller Scenario Switcher inside the Call Screen */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={() => handleSwitchLiveScenario('delivery')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer whitespace-nowrap ${
                isDelivery
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3 h-3 shrink-0" />
              <span>Delivery</span>
            </button>
            <button
              onClick={() => handleSwitchLiveScenario('spam')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer whitespace-nowrap ${
                isHighSpam
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span>Spam 95%</span>
            </button>
            <button
              onClick={() => handleSwitchLiveScenario('vip')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer whitespace-nowrap ${
                !isHighSpam && !isDelivery
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3 h-3 shrink-0" />
              <span>VIP Client</span>
            </button>
          </div>
        </div>

        {/* Caller Identity Card (Truecaller + Equal AI Verification Header) */}
        <div className="relative z-10 px-5 py-3.5 bg-slate-900/60 border-b border-white/8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isHighSpam
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : isDelivery
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {isHighSpam ? (
                <ShieldAlert className="w-6 h-6" />
              ) : isDelivery ? (
                <Package className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">{activeCaller.name}</h3>
              <p className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                {activeCaller.number} ·{' '}
                <span
                  className={
                    isHighSpam
                      ? 'text-rose-400 font-semibold'
                      : isDelivery
                      ? 'text-amber-300 font-semibold'
                      : 'text-emerald-400 font-semibold'
                  }
                >
                  {isHighSpam
                    ? `Spam Risk ${activeCaller.spamScore}%`
                    : isDelivery
                    ? 'Verified Delivery'
                    : 'Verified Contact'}
                </span>
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono tabular-nums font-bold text-emerald-400 block">
              {stage === 'incoming'
                ? 'RINGING'
                : `${String(Math.floor(callDuration / 60)).padStart(2, '0')}:${String(callDuration % 60).padStart(2, '0')}`}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {isAiSpeaking ? 'AI Speaking' : isCallerSpeaking ? 'Caller Speaking' : 'AI Active'}
            </span>
          </div>
        </div>

        {/* Center Scrollable Area: Live Streaming AI Chat Transcript */}
        <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {stage === 'incoming' && (
            <div className="h-full flex flex-col items-center justify-center text-center py-8 px-4 space-y-4">
              <div className="w-20 h-20 rounded-full bg-indigo-500/15 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <PhoneIncoming className="w-9 h-9 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Incoming Call Screening</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Equal AI is picking up this call to verify the caller’s identity and transcribe their message live.
                </p>
              </div>
              <button
                onClick={handleAiAutoAnswer}
                className="min-h-[48px] px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-[0.98] transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>Answer with Equal AI Now</span>
              </button>
            </div>
          )}

          {stage === 'blocked' && (
            <div className="my-4 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-2">
              <ShieldAlert className="w-9 h-9 mx-auto text-rose-400" />
              <h4 className="text-sm font-bold text-white">Spam Call Intercepted & Terminated</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Equal AI detected {activeCaller.spamScore}% telemarketing/fraud risk, issued a DND notice, and disconnected the call without disturbing you.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.speaker === 'caller'
                  ? 'items-start'
                  : msg.speaker === 'ai_assistant'
                  ? 'items-end'
                  : 'items-center'
              }`}
            >
              <span className="text-[10px] text-slate-400 mb-1 px-1 font-mono tabular-nums">
                {msg.speaker === 'caller'
                  ? `${activeCaller.name.split(' ')[0]} · ${msg.time}`
                  : msg.speaker === 'ai_assistant'
                  ? `Equal AI · ${msg.time}`
                  : `Your Instruction · ${msg.time}`}
              </span>
              <div
                className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.speaker === 'caller'
                    ? 'bg-slate-800/95 text-slate-100 border border-slate-700/80 rounded-tl-sm'
                    : msg.speaker === 'ai_assistant'
                    ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-950/50'
                    : 'bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[11px] rounded-xl px-3 py-1.5'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {(isAiSpeaking || isCallerSpeaking) && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 w-fit">
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] text-slate-300 font-medium">
                {isAiSpeaking ? 'Equal AI is speaking to caller...' : 'Transcribing caller audio...'}
              </span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Interactive Steering & Call Action Sheet */}
        <div className="relative z-10 bg-slate-950/95 border-t border-white/10 p-3.5 space-y-3">
          {stage === 'live_screening' && (
            <>
              {/* One-Tap Quick Response Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {[
                  { label: 'Leave package at door', text: 'Please leave package at the door' },
                  { label: 'In meeting, WhatsApp me', text: 'In meeting, send WhatsApp message' },
                  { label: 'Ask who is calling', text: 'Ask who is calling and purpose' },
                  { label: 'Call back in 2 hrs', text: 'Call back later in 2 hours' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleInstructAi(chip.text)}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white border border-slate-800 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Type Custom Instruction to Equal AI */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInstructAi(customInstruction);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="Type what Equal AI should say next..."
                  className="flex-1 min-h-[44px] bg-slate-900 border border-slate-800 rounded-xl px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="min-h-[44px] min-w-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer shrink-0"
                  title="Send instruction to AI"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Primary Thumb-Zone Call Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <button
                  onClick={() => handleBlockAndHangup(false)}
                  className="min-h-[48px] px-2 rounded-2xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Block Spam</span>
                </button>

                <button
                  onClick={handleTakeOverCall}
                  className="min-h-[48px] px-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Pick Up</span>
                </button>

                <button
                  onClick={handleFinishScreening}
                  className="min-h-[48px] px-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <PhoneOff className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="whitespace-nowrap">End & Save</span>
                </button>
              </div>
            </>
          )}

          {stage === 'user_taken' && (
            <div className="flex items-center justify-between gap-3 py-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Connected directly with {activeCaller.name}</span>
              </div>
              <button
                onClick={handleFinishScreening}
                className="min-h-[44px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                End Call
              </button>
            </div>
          )}

          {(stage === 'blocked' || stage === 'completed') && (
            <button
              onClick={() => {
                cleanup();
                onClose();
              }}
              className="w-full min-h-[48px] rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Done · Return to Mobile Assistant
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
