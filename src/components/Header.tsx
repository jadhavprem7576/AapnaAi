import React, { useState } from 'react';
import { 
  PhoneCall, 
  Globe, 
  Crown, 
  Sliders, 
  HelpCircle,
  Clock,
  Tag,
  Palette,
  Check,
  Zap,
  Sparkles
} from 'lucide-react';
import { LanguageCode, UserProfile, AdminSettings, ThemeAccent } from '../types';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '../utils/translations';
import { soundEffects } from '../utils/speechVoice';

interface HeaderProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  profile: UserProfile;
  adminSettings: AdminSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAdmin: () => void;
  onOpenGuide: () => void;
  onOpenSimulator: () => void;
  trialHoursLeft: number;
  trialMinsLeft: number;
  activeTheme: ThemeAccent;
  onThemeChange: (theme: ThemeAccent) => void;
}

const THEME_OPTIONS: { id: ThemeAccent; name: string; dotColor: string; bgClass: string; borderClass: string }[] = [
  { id: 'indigo', name: 'Cyber Sapphire', dotColor: 'bg-indigo-500', bgClass: 'from-indigo-600 to-blue-600', borderClass: 'border-indigo-500' },
  { id: 'emerald', name: 'Emerald Matrix', dotColor: 'bg-emerald-500', bgClass: 'from-emerald-500 to-teal-600', borderClass: 'border-emerald-500' },
  { id: 'amber', name: 'Royal Gold', dotColor: 'bg-amber-400', bgClass: 'from-amber-400 to-yellow-600', borderClass: 'border-amber-400' },
  { id: 'purple', name: 'Synthwave Purple', dotColor: 'bg-purple-500', bgClass: 'from-purple-600 to-pink-600', borderClass: 'border-purple-500' },
  { id: 'cyan', name: 'Cyberpunk Cyan', dotColor: 'bg-cyan-400', bgClass: 'from-cyan-400 to-blue-500', borderClass: 'border-cyan-400' },
  { id: 'crimson', name: 'Ruby Crimson', dotColor: 'bg-rose-500', bgClass: 'from-rose-500 to-red-600', borderClass: 'border-rose-500' },
];

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  profile,
  adminSettings,
  activeTab,
  setActiveTab,
  onOpenAdmin,
  onOpenGuide,
  onOpenSimulator,
  trialHoursLeft,
  trialMinsLeft,
  activeTheme,
  onThemeChange,
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const t = (key: string) => {
    const entry = UI_TRANSLATIONS[key];
    if (!entry) return key;
    return entry[currentLang as 'hi' | 'mr' | 'en'] || entry.en;
  };

  const currentThemeObj = THEME_OPTIONS.find((t) => t.id === activeTheme) || THEME_OPTIONS[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('overview')} 
              className="cursor-pointer flex items-center gap-2.5 sm:gap-3 group"
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br ${currentThemeObj.bgClass} flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-105 transition-transform`}>
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center">
                    Awaaz<span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent ml-0.5">AI</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full bg-slate-900/80">
                    Pro Voice Engine
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-1.5 font-medium">
                  <span>{currentLang === 'hi' ? 'स्मार्ट AI कॉलिंग व व्हॉट्सॲप स्मरणपत्र' : currentLang === 'mr' ? 'स्मार्ट AI कॉलिंग व व्हॉट्सॲप स्मरणपत्र' : 'Multilingual Smart Voice Reminders'}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-emerald-400 font-semibold">{currentLang === 'hi' ? 'सक्रिय' : currentLang === 'mr' ? 'सक्रिय' : 'Live'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls: Theme Selector, Language, Simulator, Admin */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">

            {/* Quick 1-Click Theme Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setIsThemeMenuOpen(!isThemeMenuOpen);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 shadow-sm transition-all cursor-pointer"
                title="Switch App Theme Palette"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span className={`w-2.5 h-2.5 rounded-full ${currentThemeObj.dotColor} ring-2 ring-white/20`} />
                <span className="hidden xl:inline text-xs">{currentThemeObj.name}</span>
              </button>

              {/* Theme Dropdown Menu */}
              {isThemeMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsThemeMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-slate-700 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                      <span>Choose App Theme</span>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="mt-1 space-y-1">
                      {THEME_OPTIONS.map((theme) => {
                        const isSelected = activeTheme === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => {
                              soundEffects.playClick();
                              onThemeChange(theme.id);
                              setIsThemeMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/20'
                                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`w-3.5 h-3.5 rounded-full ${theme.dotColor} shadow-sm`} />
                              <span>{theme.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Active Owner Discount Pill if present */}
            {adminSettings.activeGlobalDiscountPercent > 0 && !profile.isFreeAccessGrantedByOwner && (
              <button
                onClick={() => setActiveTab('subscription')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                title="Special Owner Offer Available"
              >
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>{adminSettings.activeOfferBadgeText || `${adminSettings.activeGlobalDiscountPercent}% OFF`}</span>
              </button>
            )}

            {/* Account Tier Badge / 2-Day Trial / Free VIP */}
            {profile.isFreeAccessGrantedByOwner ? (
              <button
                onClick={() => setActiveTab('subscription')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-purple-500/20 border border-amber-400/80 text-amber-300 text-xs font-black shadow-md cursor-pointer hover:border-amber-300 transition-all"
                title="100% Free Lifetime VIP Access Granted by Owner (Prem Jadhav)"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Owner Free VIP</span>
              </button>
            ) : profile.subscriptionPlan === 'trial' ? (
              <button
                onClick={() => setActiveTab('subscription')}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 hover:border-amber-400 text-xs font-medium transition-all group cursor-pointer"
                title="2-Day Free Trial"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>
                  {currentLang === 'mr' ? '२ दिवस चाचणी: ' : currentLang === 'hi' ? '२ दिन ट्रायल: ' : 'Trial: '}
                  <strong className="text-white font-mono">{trialHoursLeft}h {trialMinsLeft}m</strong>
                </span>
              </button>
            ) : (
              <span className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Crown className="w-3.5 h-3.5 text-emerald-400" />
                {profile.subscriptionPlan.toUpperCase()}
              </span>
            )}

            {/* Test Equal AI Incoming Screener Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenSimulator();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-white animate-pulse" />
              <span>
                {currentLang === 'hi' ? 'AI स्क्रीनर टेस्ट' : currentLang === 'mr' ? 'AI स्क्रीनर टेस्ट' : 'Test AI Call'}
              </span>
            </button>

            {/* Language Switcher Dropdown */}
            <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl px-2 py-1">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <select
                value={currentLang}
                onChange={(e) => {
                  soundEffects.playClick();
                  onLanguageChange(e.target.value as LanguageCode);
                }}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
                aria-label="Select Language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white py-1">
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Guide Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenGuide();
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-700 transition-colors"
              title={t('howToUse')}
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Owner Admin Panel Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenAdmin();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
              title="App Owner Controls (Prem Jadhav)"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">
                {currentLang === 'hi' ? 'मालिक एडमिन' : currentLang === 'mr' ? 'मालक ॲडमिन' : 'Owner Admin'}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex sm:hidden overflow-x-auto py-2 gap-2 border-t border-slate-800/80 text-xs no-scrollbar">
          {[
            { id: 'screening', label: '🛡️ Equal AI' },
            { id: 'overview', label: t('dashboard') },
            { id: 'queue', label: t('allQueue') },
            { id: 'subscription', label: 'UPI ' + t('subscription') },
            { id: 'profile', label: t('profile') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playClick();
                setActiveTab(tab.id);
              }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
