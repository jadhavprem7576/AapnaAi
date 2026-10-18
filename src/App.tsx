/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Calendar, 
  CreditCard, 
  User, 
  ShieldCheck, 
  HelpCircle, 
  Sliders, 
  Sparkles,
  Plus,
  Bot,
  Smartphone,
  Maximize2,
  Package,
  ShieldAlert,
  UserCheck,
  PhoneIncoming,
  Palette,
  Crown,
  Tag,
  Download
} from 'lucide-react';
import { 
  ScheduledReminder, 
  UserProfile, 
  AdminSettings, 
  PaymentTransaction, 
  LanguageCode, 
  SubscriptionPlan,
  ScreenedCall,
  EqualAiSettings,
  ThemeAccent
} from './types';
import { 
  loadReminders, 
  saveReminders, 
  loadProfile, 
  saveProfile, 
  loadAdminSettings, 
  saveAdminSettings, 
  loadPayments, 
  savePayments,
  loadScreenedCalls,
  saveScreenedCalls,
  loadEqualAiSettings,
  saveEqualAiSettings,
  INITIAL_PLANS 
} from './utils/storage';
import { CallScreeningTab } from './components/CallScreeningTab';
import { OverviewTab } from './components/OverviewTab';
import { CallsQueueTab } from './components/CallsQueueTab';
import { SubscriptionTab } from './components/SubscriptionTab';
import { ProfileTab } from './components/ProfileTab';
import { ScheduleModal, SchedulePreset } from './components/ScheduleModal';
import { CallSimulatorModal } from './components/CallSimulatorModal';
import { LiveCallScreeningModal } from './components/LiveCallScreeningModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AiGuideModal } from './components/AiGuideModal';
import { PWAInstallButton, OfflineIndicator, MobileAppInstallerModal } from './components/PWAInstallButton';
import { soundEffects } from './utils/speechVoice';

const THEME_OPTIONS: Array<{ id: ThemeAccent; name: string; swatch: string }> = [
  { id: 'indigo', name: 'Sapphire', swatch: 'bg-indigo-500' },
  { id: 'emerald', name: 'Emerald', swatch: 'bg-emerald-500' },
  { id: 'amber', name: 'Royal Gold', swatch: 'bg-amber-500' },
  { id: 'purple', name: 'Synthwave', swatch: 'bg-purple-500' },
  { id: 'cyan', name: 'Neon Cyan', swatch: 'bg-cyan-400' },
  { id: 'crimson', name: 'Crimson', swatch: 'bg-rose-500' },
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(loadAdminSettings);
  const [reminders, setReminders] = useState<ScheduledReminder[]>(loadReminders);
  const [payments, setPayments] = useState<PaymentTransaction[]>(loadPayments);
  const [screenedCalls, setScreenedCalls] = useState<ScreenedCall[]>(loadScreenedCalls);
  const [equalAiSettings, setEqualAiSettings] = useState<EqualAiSettings>(loadEqualAiSettings);
  const [currentLang, setCurrentLang] = useState<LanguageCode>(profile.preferredLanguage || 'hi');
  const [activeTab, setActiveTab] = useState<'screening' | 'overview' | 'queue' | 'subscription' | 'profile'>('screening');
  const [isMobileFrameMode, setIsMobileFrameMode] = useState(true);

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [schedulePreset, setSchedulePreset] = useState<SchedulePreset | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [selectedSimulatorReminder, setSelectedSimulatorReminder] = useState<ScheduledReminder | null>(null);
  const [isLiveScreeningOpen, setIsLiveScreeningOpen] = useState(false);
  const [incomingCallPreset, setIncomingCallPreset] = useState<Partial<ScreenedCall> | undefined>(undefined);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAppInstallerOpen, setIsAppInstallerOpen] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // 2-Day Trial Countdown calculation
  const [trialTimeLeft, setTrialTimeLeft] = useState({ hours: 47, mins: 58, secs: 30 });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const start = new Date(profile.trialStartDate).getTime();
      const durationMs = (profile.trialDurationDays || 2) * 24 * 60 * 60 * 1000;
      const expiry = start + durationMs;
      const diff = expiry - Date.now();

      if (diff <= 0) {
        setTrialTimeLeft({ hours: 0, mins: 0, secs: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTrialTimeLeft({ hours, mins, secs });
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [profile.trialStartDate, profile.trialDurationDays]);

  // Periodic Auto-Sync simulation
  useEffect(() => {
    const syncInterval = setInterval(() => {
      triggerSilentSync();
    }, (adminSettings.autoSyncIntervalSec || 15) * 1000);
    return () => clearInterval(syncInterval);
  }, [adminSettings.autoSyncIntervalSec]);

  const triggerSilentSync = () => {
    const updatedProfile = {
      ...profile,
      lastSyncedAt: new Date().toISOString(),
    };
    saveProfile(updatedProfile);
  };

  const handleManualSync = () => {
    soundEffects.playClick();
    setIsSyncing(true);
    setTimeout(() => {
      const updatedProfile = {
        ...profile,
        lastSyncedAt: new Date().toISOString(),
      };
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
      setIsSyncing(false);
      soundEffects.playSuccess();
    }, 700);
  };

  // Handlers for Reminders
  const handleSaveReminder = (newReminder: ScheduledReminder) => {
    const updated = [newReminder, ...reminders];
    setReminders(updated);
    saveReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
  };

  const handleUpdateReminderStatus = (id: string, status: ScheduledReminder['status']) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, status } : r));
    setReminders(updated);
    saveReminders(updated);
  };

  const handleCallCompleted = (id: string, outcome: string, status: ScheduledReminder['status']) => {
    const updated = reminders.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status,
          callOutcomeNotes: outcome,
          lastAttemptAt: new Date().toISOString(),
        };
      }
      return r;
    });
    setReminders(updated);
    saveReminders(updated);
  };

  // Profile Update
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveProfile(updated);
  };

  // Plan Upgrade via UPI, Promo Coupon or Owner Free VIP
  const handleUpgradePlan = (
    planId: SubscriptionPlan['id'],
    txRef: string,
    method: PaymentTransaction['paymentMethod'],
    couponApplied?: string,
    amountPaid?: number
  ) => {
    const targetPlan = INITIAL_PLANS.find((p) => p.id === planId) || INITIAL_PLANS[1];
    const finalAmount = amountPaid !== undefined ? amountPaid : targetPlan.priceINR;

    const newTx: PaymentTransaction = {
      id: 'tx_' + Date.now(),
      userEmail: profile.email,
      planId: planId,
      planName: targetPlan.name,
      amountINR: finalAmount,
      originalAmountINR: targetPlan.priceINR,
      vpaAddress:
        method === 'owner_free_grant' || method === 'promo_100'
          ? `${adminSettings.ownerName} (Owner Free VIP Access)`
          : adminSettings.ownerVpa,
      transactionRef: txRef,
      paymentMethod: method,
      status: 'success',
      date: new Date().toLocaleString(),
      customerName: profile.name,
      couponApplied,
    };
    const updatedPayments = [newTx, ...payments];
    setPayments(updatedPayments);
    savePayments(updatedPayments);

    const nextExpiry = new Date();
    nextExpiry.setFullYear(nextExpiry.getFullYear() + (method === 'owner_free_grant' ? 10 : 1));
    const isFree = method === 'owner_free_grant' || finalAmount === 0 || profile.isFreeAccessGrantedByOwner;

    const updatedProfile: UserProfile = {
      ...profile,
      subscriptionPlan: planId,
      subscriptionExpiryDate: nextExpiry.toISOString(),
      isFreeAccessGrantedByOwner: isFree,
      freeAccessPlan: isFree ? planId : profile.freeAccessPlan,
      lastSyncedAt: new Date().toISOString(),
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  const handleSaveAdminSettings = (settings: AdminSettings) => {
    setAdminSettings(settings);
    saveAdminSettings(settings);
  };

  const handleScreenedCallFinished = (call: ScreenedCall) => {
    const updated = [call, ...screenedCalls];
    setScreenedCalls(updated);
    saveScreenedCalls(updated);
  };

  const handleDeleteScreenedCall = (id: string) => {
    const updated = screenedCalls.filter((c) => c.id !== id);
    setScreenedCalls(updated);
    saveScreenedCalls(updated);
  };

  const handleSimulateIncomingCall = (preset?: Partial<ScreenedCall>) => {
    setIncomingCallPreset(preset);
    setIsLiveScreeningOpen(true);
  };

  const handleOpenSimulator = (reminder?: ScheduledReminder) => {
    if (reminder) {
      setSelectedSimulatorReminder(reminder);
      setIsSimulatorOpen(true);
    } else {
      handleSimulateIncomingCall({
        callerName:
          currentLang === 'mr'
            ? 'बजाज फायनान्स लोन (संशयित स्पॅम)'
            : currentLang === 'hi'
            ? 'बजाज फाइनेंस लोन (संभावित स्पैम)'
            : 'Bajaj Personal Loan Telemarketing',
        callerNumber: '+91 140 982 1102',
        callerType: 'fraud_scam',
        spamScore: 94,
        language: currentLang,
      });
    }
  };

  // Check if current user has free access
  const matchingGrant = (adminSettings.freeAccessGrants || []).find(
    (g) =>
      g.isActive &&
      ((profile.email && g.userIdentifier.toLowerCase() === profile.email.toLowerCase()) ||
        (profile.phoneNumber && g.userIdentifier === profile.phoneNumber))
  );
  const isUserGrantedFreeByOwner =
    Boolean(profile.isFreeAccessGrantedByOwner) ||
    Boolean(matchingGrant) ||
    Boolean(adminSettings.globalFreeAccessEnabled);

  const activeTheme = adminSettings.activeTheme || profile.themeAccent || 'indigo';

  const handleThemeChange = (theme: ThemeAccent) => {
    soundEffects.playClick();
    setAdminSettings((prev) => {
      const updated = { ...prev, activeTheme: theme };
      saveAdminSettings(updated);
      return updated;
    });
    setProfile((prev) => {
      const updated = { ...prev, themeAccent: theme };
      saveProfile(updated);
      return updated;
    });
  };

  const handleQuickToggleOwnerFreeVip = () => {
    soundEffects.playSuccess();
    const nextFreeState = !profile.isFreeAccessGrantedByOwner;
    const updatedProfile: UserProfile = {
      ...profile,
      isFreeAccessGrantedByOwner: nextFreeState,
      subscriptionPlan: nextFreeState ? 'business' : profile.subscriptionPlan,
      freeAccessPlan: nextFreeState ? 'business' : undefined,
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  const getThemeWrapperClass = () => {
    switch (activeTheme) {
      case 'emerald':
        return 'theme-emerald bg-gradient-to-b from-emerald-950/30 via-slate-950 to-slate-950 selection:bg-emerald-500';
      case 'amber':
        return 'theme-amber bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 selection:bg-amber-500';
      case 'purple':
        return 'theme-purple bg-gradient-to-b from-purple-950/30 via-slate-950 to-slate-950 selection:bg-purple-500';
      case 'cyan':
        return 'theme-cyan bg-gradient-to-b from-cyan-950/30 via-slate-950 to-slate-950 selection:bg-cyan-500';
      case 'crimson':
        return 'theme-crimson bg-gradient-to-b from-rose-950/30 via-slate-950 to-slate-950 selection:bg-rose-500';
      case 'indigo':
      default:
        return 'theme-indigo bg-gradient-to-b from-indigo-950/30 via-slate-950 to-slate-950 selection:bg-indigo-500';
    }
  };

  const renderActiveTabContent = () => (
    <>
      {activeTab === 'screening' && (
        <CallScreeningTab
          currentLang={currentLang}
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          screenedCalls={screenedCalls}
          equalAiSettings={equalAiSettings}
          onUpdateSettings={(newSettings) => {
            setEqualAiSettings(newSettings);
            saveEqualAiSettings(newSettings);
          }}
          onSimulateIncomingCall={handleSimulateIncomingCall}
          onDeleteCallRecord={handleDeleteScreenedCall}
        />
      )}

      {activeTab === 'overview' && (
        <OverviewTab
          currentLang={currentLang}
          reminders={reminders}
          profile={profile}
          adminSettings={adminSettings}
          activeTheme={activeTheme}
          onOpenSchedule={() => {
            setSchedulePreset(null);
            setIsScheduleOpen(true);
          }}
          onOpenScheduleWithPreset={(preset) => {
            setSchedulePreset(preset);
            setIsScheduleOpen(true);
          }}
          onOpenSimulatorForReminder={(r) => handleOpenSimulator(r)}
          onOpenSubscription={() => setActiveTab('subscription')}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onTriggerSync={handleManualSync}
          isSyncing={isSyncing}
        />
      )}

      {activeTab === 'queue' && (
        <CallsQueueTab
          currentLang={currentLang}
          reminders={reminders}
          onOpenSchedule={() => {
            setSchedulePreset(null);
            setIsScheduleOpen(true);
          }}
          onOpenSimulatorForReminder={(r) => handleOpenSimulator(r)}
          onDeleteReminder={handleDeleteReminder}
          onUpdateReminderStatus={handleUpdateReminderStatus}
        />
      )}

      {activeTab === 'subscription' && (
        <SubscriptionTab
          currentLang={currentLang}
          profile={profile}
          adminSettings={adminSettings}
          plans={INITIAL_PLANS}
          onUpgradePlan={handleUpgradePlan}
          payments={payments}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileTab
          currentLang={currentLang}
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onTriggerSync={handleManualSync}
          isSyncing={isSyncing}
        />
      )}
    </>
  );

  return (
    <div className={`min-h-screen text-slate-100 flex flex-col transition-colors duration-500 ${getThemeWrapperClass()}`}>
      
      {/* Top Desktop Studio Bar (Only visible on lg+ screens to switch Mobile Frame / Full View & Quick Controls) */}
      <header className="hidden lg:flex items-center justify-between px-8 py-3 border-b border-white/8 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">
              AwaazAI · Equal AI Call Assistant
            </span>
            <span className="text-xs text-slate-400 ml-3">
              {isUserGrantedFreeByOwner
                ? 'Owner Lifetime Free VIP Active'
                : `${trialTimeLeft.hours}h ${trialTimeLeft.mins}m Trial Remaining`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsMobileFrameMode(!isMobileFrameMode);
            }}
            className="min-h-[38px] px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer"
          >
            {isMobileFrameMode ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Switch to Widescreen View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Switch to Mobile Phone Frame</span>
              </>
            )}
          </button>

          {/* Owner Super Admin Portal Trigger */}
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsAdminOpen(true);
            }}
            className="min-h-[38px] px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Owner & Offer Controls</span>
          </button>
        </div>
      </header>

      {/* Main Responsive Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto lg:px-8 lg:py-6 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        
        {/* NATIVE MOBILE SHELL (420px Phone Frame on Desktop when isMobileFrameMode is true, Full-Screen on Mobile) */}
        <div
          className={`w-full flex flex-col bg-[#070b14] relative transition-all duration-300 ${
            isMobileFrameMode
              ? 'lg:w-[426px] lg:shrink-0 lg:h-[830px] lg:rounded-[46px] lg:border-[6px] lg:border-slate-800/90 lg:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.85)] lg:overflow-hidden min-h-screen lg:min-h-0'
              : 'max-w-5xl mx-auto min-h-screen lg:rounded-3xl lg:border lg:border-slate-800/80 lg:overflow-hidden'
          }`}
        >
          {/* Phone Dynamic Island & Status Bar (Visible on Desktop Phone Frame) */}
          {isMobileFrameMode && (
            <div className="hidden lg:flex items-center justify-between px-6 pt-2.5 pb-1.5 bg-[#070b14] text-[11px] font-mono text-slate-400 select-none shrink-0">
              <span>9:41</span>
              <div className="w-24 h-4 rounded-full bg-slate-900 border border-slate-800/80 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-indigo-500/40 mr-2" />
                <div className="w-6 h-1 rounded-full bg-slate-800" />
              </div>
              <span>5G · 100%</span>
            </div>
          )}

          {/* Compact Mobile Top App Bar (52px height — adheres to 15% sticky cap) */}
          <div className="h-[54px] px-4 bg-slate-950/90 backdrop-blur-md border-b border-white/8 flex items-center justify-between shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white truncate">AwaazAI</span>
                  {isUserGrantedFreeByOwner && (
                    <span className="text-[10px] font-bold text-emerald-400">· VIP FREE</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {activeTab === 'screening'
                    ? 'Equal AI Call Assistant'
                    : activeTab === 'overview'
                    ? 'Voice Studio & Quick Dialer'
                    : activeTab === 'queue'
                    ? `Scheduled Calls (${reminders.length})`
                    : activeTab === 'subscription'
                    ? 'VIP Plans & Offers'
                    : 'Profile & Theme'}
                </p>
              </div>
            </div>

            {/* Right Slot: Language Pill + Owner Admin Trigger */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                {(['mr', 'hi', 'en'] as LanguageCode[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      soundEffects.playClick();
                      setCurrentLang(lang);
                      setProfile((prev) => ({ ...prev, preferredLanguage: lang }));
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      currentLang === lang
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsAppInstallerOpen(true);
                }}
                className="min-h-[36px] px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                title="Download Android APK & iOS App"
              >
                <Download className="w-3.5 h-3.5" />
                <span>APK/iOS</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsAdminOpen(true);
                }}
                className="min-h-[36px] min-w-[36px] rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center cursor-pointer"
                title="Owner Super Admin Controls"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Compact Promo / Free VIP Strip */}
          {(isUserGrantedFreeByOwner || (adminSettings.activeGlobalDiscountPercent || 0) > 0) && (
            <div
              onClick={() => setActiveTab('subscription')}
              className="px-4 py-1.5 bg-indigo-950/60 border-b border-indigo-500/20 flex items-center justify-between text-[11px] cursor-pointer shrink-0"
            >
              <span className="text-indigo-200 font-medium truncate">
                {isUserGrantedFreeByOwner
                  ? 'Crown VIP: 100% Free Lifetime Access Enabled'
                  : `${adminSettings.activeOfferBannerText || 'Special Offer'} · ${adminSettings.activeGlobalDiscountPercent}% OFF`}
              </span>
              <span className="text-amber-300 font-mono font-bold shrink-0 ml-2">
                {isUserGrantedFreeByOwner ? 'FREE' : adminSettings.promoCoupons?.[0]?.code || 'VIPFREE'}
              </span>
            </div>
          )}

          {/* Scrollable Mobile Content Area (85%+ of viewport) */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 pb-24 space-y-4">
            {/* Direct 1-Tap Android APK & iOS App Download Bar */}
            <PWAInstallButton
              currentLang={currentLang}
              onOpenModal={() => setIsAppInstallerOpen(true)}
            />
            {renderActiveTabContent()}
          </div>

          {/* Fixed 5-Slot Mobile Bottom Tab Bar + Center Floating Action Button (+) */}
          <nav className="h-[68px] px-2 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 grid grid-cols-5 items-center shrink-0 sticky bottom-0 z-20">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('screening');
              }}
              className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                activeTab === 'screening' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-semibold tracking-tight mt-1 whitespace-nowrap">
                Equal AI
              </span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('overview');
              }}
              className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                activeTab === 'overview' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PhoneCall className="w-5 h-5" />
              <span className="text-[10px] font-semibold tracking-tight mt-1 whitespace-nowrap">
                Home
              </span>
            </button>

            {/* Center Elevated Floating Action Button (+) */}
            <div className="flex items-center justify-center -mt-5">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setSchedulePreset(null);
                  setIsScheduleOpen(true);
                }}
                className="w-13 h-13 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/40 border-2 border-slate-950 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                title="Schedule AI Voice Call"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('queue');
              }}
              className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                activeTab === 'queue' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] font-semibold tracking-tight mt-1 whitespace-nowrap">
                Queue ({reminders.length})
              </span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab(activeTab === 'subscription' ? 'profile' : 'subscription');
              }}
              className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                activeTab === 'subscription' || activeTab === 'profile'
                  ? 'text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-semibold tracking-tight mt-1 whitespace-nowrap">
                {activeTab === 'subscription' ? 'Profile' : 'VIP & Plan'}
              </span>
            </button>
          </nav>
        </div>

        {/* DESKTOP COMPANION STUDIO DOCK (Visible on lg+ when Mobile Frame Mode is active) */}
        {isMobileFrameMode && (
          <aside className="hidden lg:flex flex-col flex-1 max-w-xl space-y-5 pt-2">
            
            {/* Card 1: Equal AI Live Call Simulator Triggers */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-400">
                    Interactive Mobile Testing Dock
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    Trigger a Live Incoming Call on the Phone
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click any scenario below to ring the mobile screen and watch Equal AI answer the call with a real-time streaming voice transcript.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    handleSimulateIncomingCall({
                      callerName: 'Amazon Express Delivery',
                      callerNumber: '+91 91520 88990',
                      callerType: 'delivery',
                      spamScore: 6,
                      language: currentLang,
                    })
                  }
                  className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left flex items-center gap-3 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Amazon Delivery</div>
                    <div className="text-[11px] text-slate-400">Live Parcel Chat</div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleSimulateIncomingCall({
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
                    })
                  }
                  className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-left flex items-center gap-3 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Bank Loan Spam</div>
                    <div className="text-[11px] text-slate-400">94% Fraud Auto-Block</div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleSimulateIncomingCall({
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
                    })
                  }
                  className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left flex items-center gap-3 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">VIP Appointment</div>
                    <div className="text-[11px] text-slate-400">Verified Caller Chat</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSchedulePreset({
                      title: 'Instant Test Call to Myself',
                      goal:
                        currentLang === 'mr'
                          ? 'हा आवाज AI चा लाईव्ह टेस्ट कॉल आहे.'
                          : currentLang === 'hi'
                          ? 'यह आवाज़ AI का लाइव टेस्ट कॉल है।'
                          : 'This is an automated test call from Awaaz AI.',
                      contactName: profile.name || 'Prem Jadhav',
                      phoneNumber: profile.phoneNumber || '+91 98765 43210',
                      dateOffsetMins: 2,
                    });
                    setIsScheduleOpen(true);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left flex items-center gap-3 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                    <PhoneIncoming className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">1-Tap Outbound Call</div>
                    <div className="text-[11px] text-slate-400">Schedule Voice Reminder</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Card 2: Owner / Super Admin Free VIP & Offer Controls */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-amber-400">
                    Owner & Super Admin Quick Controls
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Free VIP Access & Discount Manager
                  </h3>
                </div>
                <Crown className="w-5 h-5 text-amber-400" />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white">
                    Current Account Free Lifetime VIP
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isUserGrantedFreeByOwner
                      ? '100% Free Access Granted by Owner'
                      : 'Standard Trial / Paid Tier'}
                  </div>
                </div>
                <button
                  onClick={handleQuickToggleOwnerFreeVip}
                  className={`min-h-[40px] px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isUserGrantedFreeByOwner
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isUserGrantedFreeByOwner ? 'VIP Free Active' : 'Grant Free VIP'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="flex-1 min-h-[44px] px-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Tag className="w-4 h-4" />
                  <span>Manage Offers & Free User Grants</span>
                </button>
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="min-h-[44px] px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Guide</span>
                </button>
              </div>
            </div>

            {/* Card 3: Instant 6-Theme Switcher */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <span>App Color Theme</span>
                </span>
                <span className="text-[11px] text-slate-400 capitalize">{activeTheme}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`min-h-[40px] px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTheme === t.id
                        ? 'bg-slate-800 border-white/40 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${t.swatch}`} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </aside>
        )}

      </main>

      {/* MODALS & MOBILE OVERLAYS */}
      <LiveCallScreeningModal
        isOpen={isLiveScreeningOpen}
        onClose={() => setIsLiveScreeningOpen(false)}
        onCallFinished={handleScreenedCallFinished}
        currentLang={currentLang}
        equalAiSettings={equalAiSettings}
        incomingCallPreset={incomingCallPreset}
      />

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => {
          setIsScheduleOpen(false);
          setSchedulePreset(null);
        }}
        onSaveReminder={handleSaveReminder}
        currentLang={currentLang}
        userName={profile.name}
        userPhone={profile.phoneNumber}
        initialPreset={schedulePreset}
      />

      <CallSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        reminder={selectedSimulatorReminder}
        onCallCompleted={handleCallCompleted}
        currentLang={currentLang}
      />

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        adminSettings={adminSettings}
        onSaveAdminSettings={handleSaveAdminSettings}
        payments={payments}
        currentLang={currentLang}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      <AiGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        currentLang={currentLang}
      />

      <MobileAppInstallerModal
        isOpen={isAppInstallerOpen}
        onClose={() => setIsAppInstallerOpen(false)}
        currentLang={currentLang}
      />

      <OfflineIndicator />

    </div>
  );
}
