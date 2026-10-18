import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  MessageSquare, 
  PhoneCall, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Send, 
  ChevronRight,
  Bot
} from 'lucide-react';
import { LanguageCode } from '../types';
import { soundEffects } from '../utils/speechVoice';

interface AiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
}

export const AiGuideModal: React.FC<AiGuideModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: currentLang === 'mr'
        ? 'नमस्कार! मी आवाज AI मार्गदर्शक (App Guide) आहे. हे ॲप कसे वापरावे, कॉल कसा शेड्यूल करावा किंवा व्हॉट्सॲप फॉलबॅक कसा काम करतो याबद्दल काहीही विचारा!'
        : currentLang === 'hi'
        ? 'नमस्ते! मैं आवाज़ AI सहायक हूँ। आप इस ऐप को कैसे इस्तेमाल कर सकते हैं, कॉल कैसे शेड्यूल करें, या व्हाट्सएप फॉलबॅक कैसे काम करता है, इसके बारे में मुझसे कुछ भी पूछ सकते हैं!'
        : 'Hello! I am your AwaazAI Guide. Ask me anything about scheduling calls, positive voice settings, WhatsApp failovers, or UPI payments!',
    },
  ]);

  if (!isOpen) return null;

  const handleSendQuery = (textToSend?: string) => {
    const q = textToSend || userQuery.trim();
    if (!q) return;

    soundEffects.playClick();
    const newChat = [...chatMessages, { sender: 'user' as const, text: q }];
    setChatMessages(newChat);
    if (!textToSend) setUserQuery('');

    // Thoughtful, accurate AI response based on app features
    setTimeout(() => {
      soundEffects.playSuccess();
      let reply = '';
      const lower = q.toLowerCase();

      if (lower.includes('call') || lower.includes('कॉल') || lower.includes('schedule') || lower.includes('शेड्यूल')) {
        reply = currentLang === 'mr'
          ? 'कॉल शेड्यूल करण्यासाठी वर दिलेल्या "+ नवीन कॉल शेड्यूल करा" बटणावर क्लिक करा. तारीख, वेळ, संपर्क नाव आणि फोन नंबर भरा. आपली भाषा (मराठी/हिंदी/इंग्लिश) निवडा. AI ठरलेल्या वेळी आपोआप कॉल करेल!'
          : currentLang === 'hi'
          ? 'कॉल शेड्यूल करने के लिए ऊपर "+ नया कॉल शेड्यूल करें" बटन पर क्लिक करें। वांछित तारीख व समय चुनें, संपर्क का नाम व नंबर डालें। AI निर्धारित समय पर सकारात्मक भाव से कॉल करेगा!'
          : 'To schedule a call, tap "+ Schedule New Call", select your target date & time, recipient details, and choose Hindi, Marathi, or English. The AI will place the call right on time!';
      } else if (lower.includes('whatsapp') || lower.includes('व्हॉट्स') || lower.includes('fallback') || lower.includes('उचल')) {
        reply = currentLang === 'mr'
          ? 'जर समोरच्या व्यक्तीने ८-१० सेकंदात फोन उचलला नाही, तर सिस्टीम त्वरित समजून घेते आणि आपण दिलेला निरोप थेट त्यांच्या व्हॉट्सॲपवर पाठवून देते! यामुळे आपला संदेश कधीही चुकत नाही.'
          : currentLang === 'hi'
          ? 'यदि सामने वाला व्यक्ति कॉल नहीं उठाता, तो हमारा स्मार्ट इंजन तुरंत स्वचालित रूप से व्हाट्सएप और एसएमएस पर आपका संदेश भेज देता है। आपका जरूरी काम कभी नहीं रुकेगा!'
          : 'If the recipient misses or declines the call, AwaazAI instantly triggers your pre-composed positive message via WhatsApp & SMS automatically!';
      } else if (lower.includes('payment') || lower.includes('upi') || lower.includes('पैसे') || lower.includes('free') || lower.includes('ट्रायल')) {
        reply = currentLang === 'mr'
          ? 'नवीन युझर्ससाठी पहिले २ दिवस सर्व फीचर्स १००% मोफत आहेत! त्यानंतर आपण Google Pay, PhonePe, Paytm किंवा QR कोड स्कॅन करून थेट मालक प्रेम जाधव यांच्या खात्यात पैसे पाठवून सबस्क्रिप्शन सक्रिय करू शकता.'
          : currentLang === 'hi'
          ? 'नए यूजर्स के लिए पहले २ दिन सभी प्रीमियम फीचर्स एकदम मुफ्त हैं! इसके बाद आप PhonePe, GPay या Paytm UPI द्वारा सीधे ऐप ओनर प्रेम जाधव के बैंक खाते में भुगतान कर सकते हैं।'
          : 'You get a 2-Day 100% Free Trial! After that, you can seamlessly activate Starter or Pro plans using any UPI app (GPay, PhonePe, Paytm) directly to owner Prem Jadhav.';
      } else {
        reply = currentLang === 'mr'
          ? 'आवाज AI हे भारतातील पहिले सकारात्मक AI असिस्टंट आहे. हे मराठी, हिंदी व इंग्लिश भाषेत आदरपूर्वक संवाद साधते आणि डेटा पूर्णपणे AES-256 सह सुरक्षित ठेवते!'
          : currentLang === 'hi'
          ? 'आवाज़ AI भारत का पहला सकारात्मक वॉइस कॉल और ऑटो-व्हाट्सएप असिस्टेंट है। यह हिंदी, मराठी और अंग्रेजी में आदरपूर्वक बात करता है और सारा डेटा एन्क्रिप्टेड रखता है।'
          : 'AwaazAI is an Indian multilingual AI caller and automated WhatsApp failover engine supporting Hindi, Marathi, and English with AES-256 encryption.';
      }

      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden my-6 text-white flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {currentLang === 'hi' ? 'AI ऐप गाइड (How To Use)' : currentLang === 'mr' ? 'AI ॲप मार्गदर्शक (कसे वापरावे)' : 'AI App Guide & Onboarding'}
              </h3>
              <p className="text-xs text-slate-400">
                {currentLang === 'hi' ? 'ऐप के सभी फीचर्स और उपयोग की पूरी जानकारी' : currentLang === 'mr' ? 'ॲपचे सर्व फीचर्स व वापरण्याची सोपी पद्धत' : 'Step-by-step instructions and interactive assistance'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Quick Visual Guide */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs mb-1.5">
              1
            </div>
            <p className="font-bold text-white">
              {currentLang === 'hi' ? 'तारीख व समय चुनें' : currentLang === 'mr' ? 'तारीख व वेळ निवडा' : '1. Schedule Date'}
            </p>
            <span className="text-[10px] text-slate-400">
              Set exact date/time
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs mb-1.5">
              2
            </div>
            <p className="font-bold text-white">
              {currentLang === 'hi' ? 'सकारात्मक AI भाषा' : currentLang === 'mr' ? 'सकारात्मक भाषा' : '2. Positive Voice'}
            </p>
            <span className="text-[10px] text-slate-400">
              Hindi / Marathi / English
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-1.5">
              3
            </div>
            <p className="font-bold text-white">
              {currentLang === 'hi' ? 'व्हाट्सएप फॉलबॅक' : currentLang === 'mr' ? 'व्हॉट्सॲप फॉलबॅक' : '3. WhatsApp Fallback'}
            </p>
            <span className="text-[10px] text-slate-400">
              Auto-sends if no answer
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs mb-1.5">
              4
            </div>
            <p className="font-bold text-white">
              {currentLang === 'hi' ? '2 दिन फ्री ट्रायल' : currentLang === 'mr' ? '२ दिवस चाचणी' : '4. 2-Day Trial'}
            </p>
            <span className="text-[10px] text-slate-400">
              Then easy UPI upgrade
            </span>
          </div>

        </div>

        {/* Quick FAQ Chips */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-slate-400 shrink-0 font-medium">Quick Questions:</span>
          {[
            { text: currentLang === 'mr' ? 'कॉल न उचलल्यास काय होते?' : currentLang === 'hi' ? 'कॉल न उठाने पर क्या होता है?' : 'What happens if call unanswered?' },
            { text: currentLang === 'mr' ? '२ दिवस फ्री ट्रायल कसा आहे?' : currentLang === 'hi' ? '२ दिन का फ्री ट्रायल कैसे है?' : 'How does 2-day trial work?' },
            { text: currentLang === 'mr' ? 'UPI पेमेंट कसे करायचे?' : currentLang === 'hi' ? 'UPI पेमेंट कैसे करें?' : 'How to pay via UPI?' },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(chip.text)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-900/40 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              {chip.text}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="p-5 flex-1 max-h-72 overflow-y-auto space-y-3 text-xs leading-relaxed">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendQuery();
            }}
            placeholder={currentLang === 'hi' ? 'ऐप के बारे में कोई भी प्रश्न पूछें...' : currentLang === 'mr' ? 'ॲप बद्दल कोणताही प्रश्न विचारा...' : 'Ask any question about AwaazAI...'}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSendQuery()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
