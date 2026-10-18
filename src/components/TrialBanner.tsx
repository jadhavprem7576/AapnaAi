import React from 'react';
import { Sparkles, Clock, ArrowRight, ShieldCheck, Zap, Crown, Tag, Gift } from 'lucide-react';
import { LanguageCode, AdminSettings } from '../types';
import { soundEffects } from '../utils/speechVoice';

interface TrialBannerProps {
  currentLang: LanguageCode;
  hoursLeft: number;
  minsLeft: number;
  secsLeft: number;
  onUpgradeClick: () => void;
  isTrial: boolean;
  planName: string;
  isFreeAccess?: boolean;
  adminSettings?: AdminSettings;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({
  currentLang,
  hoursLeft,
  minsLeft,
  secsLeft,
  onUpgradeClick,
  isTrial,
  planName,
  isFreeAccess,
  adminSettings,
}) => {
  // 1. If 100% Free VIP is granted by Owner
  if (isFreeAccess) {
    return (
      <div className="bg-gradient-to-r from-amber-950/70 via-purple-950/60 to-emerald-950/70 border-b border-amber-500/40 px-4 py-2.5 text-xs text-white shadow-lg">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-amber-300">
                100% Free Lifetime VIP Access Active
              </span>
              <span className="text-slate-300 ml-1.5 hidden sm:inline">
                • Granted by App Owner ({adminSettings?.ownerName || 'Prem Jadhav'}). All AI calls & WhatsApp features unlocked with ₹0 charges.
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full font-bold">
              👑 OWNER VIP VERIFIED
            </span>
            <button
              onClick={() => {
                soundEffects.playClick();
                onUpgradeClick();
              }}
              className="text-xs text-amber-300 hover:text-white underline font-semibold cursor-pointer"
            >
              View Perks
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. If Owner has set an Active Flash Announcement Ticker
  const showOfferTicker = adminSettings?.isOfferBannerVisible && adminSettings?.activeOfferBannerText;

  // 3. Paid active plan
  if (!isTrial) {
    return (
      <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-4 py-2 text-xs text-emerald-300">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {currentLang === 'hi' 
                ? `सक्रिय योजना: ${planName.toUpperCase()} — असीमित AI कॉल और व्हाट्सएप सक्रिय है`
                : currentLang === 'mr'
                ? `सक्रिय प्लॅन: ${planName.toUpperCase()} — अमर्याद AI कॉल व व्हॉट्सॲप सुरू आहे`
                : `Active Plan: ${planName.toUpperCase()} — Automated AI calls & WhatsApp gateway active`}
            </span>
          </div>
          <span className="text-[11px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200">
            UPI Verified Account
          </span>
        </div>
      </div>
    );
  }

  // 4. Trial Mode + Optional Owner Offer Ticker
  return (
    <div className="flex flex-col">
      {/* Optional Top Flash Offer Ticker from Owner */}
      {showOfferTicker && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-purple-900/60 to-amber-950/80 border-b border-indigo-500/30 px-4 py-1.5 text-xs text-amber-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span className="truncate font-medium">{adminSettings.activeOfferBannerText}</span>
            </div>
            <button
              onClick={() => {
                soundEffects.playClick();
                onUpgradeClick();
              }}
              className="text-[11px] font-bold text-white bg-indigo-600/60 hover:bg-indigo-600 px-2.5 py-0.5 rounded-full shrink-0 border border-indigo-400/30 transition-all cursor-pointer"
            >
              Claim Offer
            </button>
          </div>
        </div>
      )}

      {/* Trial Countdown Bar */}
      <div className="bg-gradient-to-r from-amber-950/60 via-indigo-950/40 to-purple-950/60 border-b border-amber-500/30 px-4 py-2.5 sm:py-3 text-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs">
              <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
              {currentLang === 'hi' ? '२ दिन का फ्री ट्रायल' : currentLang === 'mr' ? '२ दिवसांची मोफत चाचणी' : '2-Day Full Feature Free Trial'}
            </span>
            <p className="text-slate-300 text-xs sm:text-sm">
              {currentLang === 'hi' ? (
                <>सभी प्रीमियम AI कॉलिंग, सकारात्मक संदेश व व्हाट्सएप फॉलबॅक फ्री में आजमाएं!</>
              ) : currentLang === 'mr' ? (
                <>सर्व प्रीमियम AI व्हॉइस कॉल्स, सकारात्मक संदेश व व्हॉट्सॲप फॉलबॅक मोफत अनुभवा!</>
              ) : (
                <>Experience all premium AI Voice Calls, Positive Reminders & WhatsApp Fallback free!</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700 text-xs sm:text-sm shadow-inner">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {String(hoursLeft).padStart(2, '0')}h : {String(minsLeft).padStart(2, '0')}m : {String(secsLeft).padStart(2, '0')}s
              </span>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                onUpgradeClick();
              }}
              className="flex items-center gap-1 px-3 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>{currentLang === 'hi' ? 'UPI से एक्टिव करें' : currentLang === 'mr' ? 'UPI द्वारे ॲक्टिव्हेट करा' : 'Activate with UPI'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
