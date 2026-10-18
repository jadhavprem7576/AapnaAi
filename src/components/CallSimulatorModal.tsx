import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  User
} from 'lucide-react';
import { ScheduledReminder, LanguageCode } from '../types';
import { soundEffects, speakText, stopSpeaking, AI_VOICE_PROFILES } from '../utils/speechVoice';

interface CallSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: ScheduledReminder | null;
  onCallCompleted: (id: string, outcome: string, status: ScheduledReminder['status']) => void;
  currentLang: LanguageCode;
}

export const CallSimulatorModal: React.FC<CallSimulatorModalProps> = ({
  isOpen,
  onClose,
  reminder,
  onCallCompleted,
  currentLang,
}) => {
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'no_answer' | 'fallback_dispatched' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [callerReply, setCallerReply] = useState('');
  const durationTimerRef = useRef<number | null>(null);
  const ringTimeoutRef = useRef<number | null>(null);

  // Defaults if no specific reminder was passed
  const activeReminder: ScheduledReminder = reminder || {
    id: 'demo_call',
    contactName: 'सुनीता शर्मा (Demo Contact)',
    phoneNumber: '+91 98234 56789',
    scheduledDateTime: new Date().toISOString(),
    language: currentLang,
    voiceTone: 'empathetic',
    callGoal: 'स्वास्थ्य व शुभ प्रभात सकारात्मक संदेश',
    customScript: currentLang === 'mr'
      ? 'नमस्कार! प्रेम जाधव यांच्या वतीने मी आपला AI कॉल असिस्टंट बोलत आहे. आजचा आपला दिवस खूप उत्साही आणि यशस्वी जावो. आपली नियमित औषधे वेळेवर घ्यायला विसरू नका. आपले आरोग्य उत्तम राहो हीच सदिच्छा!'
      : currentLang === 'hi'
      ? 'नमस्ते जी! प्रेम जाधव की ओर से मैं आपका AI सहायक बात कर रहा हूँ। आज आपका दिन बहुत ही मंगलमय, सुखद और ऊर्जावान रहे। समय पर अपनी दवाइयां व जलपान लेना न भूलें। आपका बहुत-बहुत धन्यवाद!'
      : 'Hello! I am calling on behalf of Prem Jadhav with a positive reminder. Wishing you a wonderful, peaceful, and productive day ahead! Please take good care of your health.',
    fallbackOption: 'call_then_whatsapp',
    whatsappMessage: currentLang === 'mr'
      ? 'नमस्कार! 🌿 प्रेम जाधव यांच्या वतीने निरोप: आपण कॉल उचलू शकला नाहीत, म्हणून हा व्हॉट्सॲप मेसेज पाठवत आहोत. काळजी घ्या व दिवस आनंदात जावो!'
      : currentLang === 'hi'
      ? 'नमस्ते जी! 🌸 प्रेम जाधव की ओर से संदेश: कॉल पर संपर्क न होने के कारण यह व्हाट्सएप संदेश भेजा जा रहा है। अपना ख्याल रखें और दिन शुभ हो!'
      : 'Hello! 🌟 Message from Prem Jadhav: You missed the call, so sharing this positive note on WhatsApp. Have a great day!',
    smsMessage: 'AwaazAI: Namaste, gentle reminder from Prem Jadhav. Missed call, sending text. Have a blessed day!',
    retryOnNoAnswer: true,
    maxRetries: 3,
    retryIntervalMinutes: 5,
    status: 'calling',
    createdAt: new Date().toISOString(),
  };

  useEffect(() => {
    if (isOpen) {
      startRinging();
    } else {
      cleanupCall();
    }
    return () => {
      cleanupCall();
    };
  }, [isOpen]);

  const startRinging = () => {
    setCallState('ringing');
    setCallDuration(0);
    setSpokenTranscript('');
    setCallerReply('');
    soundEffects.playRing();

    // Auto-timeout after 9 seconds of ringing if no one answers -> trigger fallback
    ringTimeoutRef.current = window.setTimeout(() => {
      handleNoAnswer();
    }, 9000);
  };

  const handleAnswerCall = () => {
    soundEffects.stopRing();
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
    }
    soundEffects.playClick();
    setCallState('connected');
    setIsSpeaking(true);

    // Start timer
    durationTimerRef.current = window.setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Speak the positive script with selected AI voice profile
    setSpokenTranscript(activeReminder.customScript);
    speakText(
      activeReminder.customScript,
      activeReminder.language,
      activeReminder.voiceTone,
      () => {
        setIsSpeaking(false);
      },
      activeReminder.voiceId
    );
  };

  const handleNoAnswer = () => {
    soundEffects.stopRing();
    stopSpeaking();
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);

    setCallState('no_answer');

    // Auto-dispatch fallback after 1.5 seconds
    setTimeout(() => {
      dispatchFallback();
    }, 1200);
  };

  const dispatchFallback = () => {
    soundEffects.playSuccess();
    setCallState('fallback_dispatched');
    const isSms = activeReminder.fallbackOption === 'call_then_sms';
    const status: ScheduledReminder['status'] = isSms ? 'sms_fallback_sent' : 'whatsapp_fallback_sent';
    onCallCompleted(
      activeReminder.id,
      isSms
        ? 'Unanswered call. Automated Normal Text SMS sent to recipient carrier.'
        : 'Unanswered call. Automated WhatsApp/SMS fallback triggered immediately.',
      status
    );
  };

  const handleEndCall = () => {
    cleanupCall();
    setCallState('ended');
    onCallCompleted(
      activeReminder.id,
      `AI Call completed successfully. Duration: ${callDuration}s. Positive delivery acknowledged.`,
      'completed'
    );
  };

  const cleanupCall = () => {
    soundEffects.stopRing();
    stopSpeaking();
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
  };

  const handleUserReply = (replyText: string) => {
    soundEffects.playClick();
    setCallerReply(replyText);
    setIsSpeaking(true);

    const acknowledgement = activeReminder.language === 'mr'
      ? 'खूप खूप धन्यवाद! आपला हा प्रेमळ प्रतिसाद नोंदवला गेला असून प्रेम यांच्याकडे अपडेट पाठवला आहे. काळजी घ्या!'
      : activeReminder.language === 'hi'
      ? 'बहुत-बहुत धन्यवाद! आपकी यह सुखद प्रतिक्रिया दर्ज कर ली गई है और प्रेम जी तक पहुंचा दी गई है। आपका दिन बहुत ही शुभ रहे!'
      : 'Thank you very much! Your response has been noted and updated to Prem Jadhav. Have a blessed day!';

    setSpokenTranscript((prev) => prev + '\n\nAI Assistant: ' + acknowledgement);
    speakText(acknowledgement, activeReminder.language, activeReminder.voiceTone, () => {
      setIsSpeaking(false);
    });
  };

  if (!isOpen) return null;

  const cleanPhoneForWhatsApp = activeReminder.phoneNumber.replace(/[^\d]/g, '');
  const encodedWaText = encodeURIComponent(activeReminder.whatsappMessage);
  const waUrl = `https://wa.me/${cleanPhoneForWhatsApp}?text=${encodedWaText}`;
  const smsUrl = `sms:${activeReminder.phoneNumber}?body=${encodeURIComponent(activeReminder.smsMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold text-slate-300">
              {currentLang === 'hi' ? 'लाइव AI कॉल सिम्युलेटर' : currentLang === 'mr' ? 'लाईव्ह AI कॉल सिम्युलेटर' : 'Live AI Call Simulator'}
            </span>
          </div>
          <button
            onClick={() => {
              cleanupCall();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Smartphone Call Screen */}
        <div className="p-6 flex flex-col items-center text-center">
          
          {/* Avatar / Pulse circle */}
          <div className="relative my-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              callState === 'ringing'
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 animate-pulse ring-8 ring-indigo-500/20'
                : callState === 'connected'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 ring-8 ring-emerald-500/20'
                : callState === 'no_answer' || callState === 'fallback_dispatched'
                ? 'bg-gradient-to-tr from-amber-600 to-orange-600 ring-8 ring-amber-500/20'
                : 'bg-slate-800 ring-4 ring-slate-700'
            }`}>
              <Phone className={`w-10 h-10 text-white ${callState === 'ringing' ? 'animate-bounce' : ''}`} />
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white shadow-lg animate-pulse flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Speaking
              </span>
            )}
          </div>

          {/* Contact Details */}
          <h3 className="text-xl font-bold text-white tracking-wide mt-1">
            {activeReminder.contactName}
          </h3>
          <p className="text-sm font-mono text-slate-400 mt-0.5">
            {activeReminder.phoneNumber}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              🗣️ {activeReminder.language === 'mr' ? 'मराठी (Marathi)' : activeReminder.language === 'hi' ? 'हिंदी (Hindi)' : activeReminder.language === 'gu' ? 'ગુજરાતી' : 'English (India)'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30">
              🎙️ {AI_VOICE_PROFILES.find((v) => v.id === activeReminder.voiceId)?.name || 'Priya AI'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              {activeReminder.voiceTone} Tone
            </span>
          </div>

          {/* Call Status Badge */}
          <div className="my-4">
            {callState === 'ringing' && (
              <div className="flex flex-col items-center">
                <span className="text-indigo-400 font-semibold text-sm animate-pulse">
                  {currentLang === 'hi' ? 'घंटी बज रही है (Outgoing Call Ringing)...' : currentLang === 'mr' ? 'रिंग होत आहे (Outgoing Call Ringing)...' : 'Outgoing Call Ringing...'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  {activeReminder.fallbackOption === 'call_then_sms'
                    ? (currentLang === 'hi' ? 'उत्तर न देने पर 8 सेकंड में सामान्य टेक्स्ट SMS स्वतः जाएगा' : currentLang === 'mr' ? 'कॉल न उचलल्यास ८ सेकंदात सामान्य टेक्स्ट SMS जाईल' : 'Auto-failover to Normal Text SMS in 8s if unanswered')
                    : (currentLang === 'hi' ? 'उत्तर न देने पर 8 सेकंड में व्हाट्सएप व SMS ट्रिगर होगा' : currentLang === 'mr' ? 'कॉल न उचलल्यास ८ सेकंदात व्हॉट्सॲप व SMS जाईल' : 'Auto-failover to WhatsApp & SMS in 8s if unanswered')}
                </span>
              </div>
            )}

            {callState === 'connected' && (
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, '0')}
                </span>
              </div>
            )}

            {callState === 'no_answer' && (
              <div className="text-amber-400 font-medium text-sm flex items-center gap-1.5 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-500/30">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>{currentLang === 'hi' ? 'कॉल का कोई उत्तर नहीं मिला (No Answer)' : currentLang === 'mr' ? 'कॉल उत्तर मिळाला नाही (No Answer)' : 'No Answer Detected'}</span>
              </div>
            )}

            {callState === 'fallback_dispatched' && (
              <div className="text-emerald-300 font-medium text-xs flex flex-col items-center gap-1 bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/30">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">
                    {currentLang === 'hi' ? 'व्हाट्सएप व SMS फॉलबॅक तुरंत भेजा गया!' : currentLang === 'mr' ? 'व्हॉट्सॲप व SMS फॉलबॅक लगेच पाठवले!' : 'Automated WhatsApp & SMS Sent!'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-300">
                  {currentLang === 'hi' ? 'कॉल न मिलने पर यूजर को सीधा संदेश मिल गया' : currentLang === 'mr' ? 'कॉल न उचलल्यामुळे युझरला लगेच मेसेज मिळाला' : 'Failover triggered successfully on missed response'}
                </span>
              </div>
            )}

            {callState === 'ended' && (
              <span className="text-slate-400 text-sm">
                {currentLang === 'hi' ? 'कॉल समाप्त' : currentLang === 'mr' ? 'कॉल समाप्त' : 'Call Completed'}
              </span>
            )}
          </div>

          {/* Spoken Transcript Area */}
          {(callState === 'connected' || callState === 'ended') && (
            <div className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 my-2 text-left max-h-40 overflow-y-auto text-xs leading-relaxed">
              <div className="flex items-center justify-between text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                <span>AI Live Transcript</span>
                {isSpeaking && <span className="text-emerald-400 animate-pulse">● Speaking Aloud</span>}
              </div>
              <p className="text-slate-200 whitespace-pre-line font-serif italic">
                "{spokenTranscript || activeReminder.customScript}"
              </p>
            </div>
          )}

          {/* Quick Positive Response Simulation for Receiver */}
          {callState === 'connected' && (
            <div className="w-full mt-2 bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-left">
              <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
                {currentLang === 'hi' ? 'कॉलर का सकारात्मक उत्तर सिमुलेट करें:' : currentLang === 'mr' ? 'कॉलरचा प्रतिसाद सिमुलेट करा:' : 'Simulate Contact Answering:'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { 
                    label: currentLang === 'mr' ? 'हो, धन्यवाद! मी औषध घेतो' : currentLang === 'hi' ? 'हाँ, धन्यवाद! मैं दवाई लेता हूँ' : 'Yes, thank you! I will take medicine',
                    text: 'Thank you for reminding, I will take it immediately!'
                  },
                  { 
                    label: currentLang === 'mr' ? 'होय, मी मिटिंगमध्ये वेळेवर पोहोचतो' : currentLang === 'hi' ? 'जी, मैं मीटिंग में समय पर आऊंगा' : 'Yes, I will attend on time',
                    text: 'Confirmed, I will join on time!'
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUserReply(item.text)}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 transition-colors"
                  >
                    "{item.label}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fallback View & Normal SMS / WhatsApp Link Buttons */}
          {(callState === 'fallback_dispatched' || activeReminder.status === 'whatsapp_fallback_sent' || activeReminder.status === 'sms_fallback_sent') && (
            <div className="w-full space-y-2 my-2 text-left">
              
              {/* Normal SMS Text Fallback Card */}
              <div className="bg-slate-900 border border-sky-500/40 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    Normal Text Message (SMS) Sent
                  </span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono">
                    SMS Carrier Dispatched
                  </span>
                </div>
                <p className="text-xs text-slate-200 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 leading-relaxed font-mono mb-2">
                  {activeReminder.smsMessage || `AwaazAI: Namaste ${activeReminder.contactName}, missed call reminder: ${activeReminder.callGoal}`}
                </p>
                <a
                  href={smsUrl}
                  className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open & Send in Phone SMS App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* WhatsApp Fallback Card */}
              {activeReminder.fallbackOption !== 'call_then_sms' && (
                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp Fallback Message
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      WhatsApp Cloud
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 leading-relaxed font-sans mb-2">
                    {activeReminder.whatsappMessage}
                  </p>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Phone Action Buttons */}
          <div className="w-full mt-4 flex items-center justify-center gap-4">
            {callState === 'ringing' && (
              <>
                <button
                  onClick={handleAnswerCall}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>{currentLang === 'hi' ? 'उत्तर दें (Answer Call)' : currentLang === 'mr' ? 'कॉल उचला (Answer)' : 'Answer Call'}</span>
                </button>

                <button
                  onClick={handleNoAnswer}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>{currentLang === 'hi' ? 'कोई उत्तर नहीं (No Answer)' : currentLang === 'mr' ? 'उचलला नाही (No Answer)' : 'No Answer / Busy'}</span>
                </button>
              </>
            )}

            {callState === 'connected' && (
              <>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    isMuted ? 'bg-amber-600/20 border-amber-500/40 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>{currentLang === 'hi' ? 'कॉल समाप्त करें' : currentLang === 'mr' ? 'कॉल समाप्त करा' : 'Hang Up Call'}</span>
                </button>
              </>
            )}

            {(callState === 'ended' || callState === 'fallback_dispatched') && (
              <button
                onClick={() => {
                  cleanupCall();
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
              >
                {currentLang === 'hi' ? 'सिम्युलेटर बंद करें' : currentLang === 'mr' ? 'सिम्युलेटर बंद करा' : 'Close Simulator'}
              </button>
            )}
          </div>

        </div>

        {/* Security & Sync Footer */}
        <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            AES-256 Voice Call Encryption
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            Awaaz AI Engine v2.4
          </span>
        </div>

      </div>
    </div>
  );
};
