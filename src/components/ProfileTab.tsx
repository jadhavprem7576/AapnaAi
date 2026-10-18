import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Lock, 
  RefreshCw, 
  Download, 
  Key, 
  Globe, 
  CheckCircle2, 
  Sliders,
  Check,
  Building,
  Briefcase,
  MessageSquare,
  Bot,
  Volume2,
  Clock,
  Sparkles,
  CreditCard,
  Crown,
  Palette
} from 'lucide-react';
import { UserProfile, LanguageCode, ThemeAccent } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/translations';
import { soundEffects, speakText, stopSpeaking, AI_VOICE_PROFILES } from '../utils/speechVoice';

interface ProfileTabProps {
  currentLang: LanguageCode;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currentLang,
  profile,
  onUpdateProfile,
  onTriggerSync,
  isSyncing,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ 
    ...profile,
    whatsappNotificationNumber: profile.whatsappNotificationNumber || profile.phoneNumber || '+91 98234 56789',
    alternatePhoneNumber: profile.alternatePhoneNumber || '',
    companyName: profile.companyName || 'Jadhav Enterprises',
    profession: profile.profession || 'Business Owner & Founder',
    avatarIcon: profile.avatarIcon || '👑',
    assistantPersonaName: profile.assistantPersonaName || 'Awaaz Priya AI',
    assistantVoiceGender: profile.assistantVoiceGender || 'female',
    customWelcomeGreeting: profile.customWelcomeGreeting || (
      currentLang === 'mr' 
        ? 'नमस्कार! मी प्रेम जाधव यांचा AI असिस्टंट बोलत आहे. आपण कोण बोलत आहात आणि कशाबद्दल फोन केला आहे?'
        : 'नमस्ते! मैं प्रेम जाधव जी का AI असिस्टेंट बोल रहा हूँ। आप कौन बोल रहे हैं और किस विषय में कॉल किया है?'
    ),
    dndStartHour: profile.dndStartHour || '22:00',
    dndEndHour: profile.dndEndHour || '08:00',
    dndAutoRejectSpam: profile.dndAutoRejectSpam ?? true,
    upiId: profile.upiId || 'jadhavprem638@okaxis',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pinInput, setPinInput] = useState(profile.pinCode || '1234');
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playSuccess();
    const updated: UserProfile = {
      ...formData,
      pinCode: pinInput,
      lastSyncedAt: new Date().toISOString(),
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestGreeting = () => {
    if (isPlayingGreeting) {
      stopSpeaking();
      setIsPlayingGreeting(false);
      return;
    }
    soundEffects.playClick();
    setIsPlayingGreeting(true);
    speakText(formData.customWelcomeGreeting, formData.preferredLanguage, 'professional', () => {
      setIsPlayingGreeting(false);
    });
  };

  const handleExportData = () => {
    soundEffects.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `awaaz_profile_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const avatarOptions = ['👑', '💼', '🚀', '🎙️', '🌟', '🛡️', '⚡', '🌸'];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-500/20">
            {formData.avatarIcon || '👑'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {formData.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                App Owner & Master Account
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {formData.profession} • {formData.companyName}
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Email: {formData.email} • WhatsApp: {formData.whatsappNotificationNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Vault'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl flex items-center gap-2.5 text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            {currentLang === 'hi' 
              ? 'प्रोफाइल विवरण, AI असिस्टेंट और सुरक्षा सेटिंग्स सफलतापूर्वक सहेजी गईं!' 
              : currentLang === 'mr' 
              ? 'प्रोफाइल तपशील, AI असिस्टंट व सुरक्षा सेटिंग्ज यशस्वीरीत्या सेव्ह झाल्या!' 
              : 'Profile details, AI persona, and security settings saved securely!'}
          </span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: Personal & Business Contact Details */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Personal Identity & Business Contact Details</span>
            </h3>
            
            {/* Avatar picker */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 mr-1.5">Avatar:</span>
              {avatarOptions.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => {
                    soundEffects.playClick();
                    setFormData({ ...formData, avatarIcon: icon });
                  }}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                    formData.avatarIcon === icon
                      ? 'bg-indigo-600 scale-110 ring-2 ring-indigo-400'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {currentLang === 'hi' ? 'पूरा नाम (Full Name)' : currentLang === 'mr' ? 'पूर्ण नाव (Full Name)' : 'Full Name'} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {currentLang === 'hi' ? 'ईमेल पता (Email Address)' : currentLang === 'mr' ? 'ईमेल पत्ता (Email Address)' : 'Email Address'} *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Primary Mobile Number *</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Notification Number *</span>
              </label>
              <input
                type="tel"
                required
                value={formData.whatsappNotificationNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNotificationNumber: e.target.value })}
                placeholder="+91 98234 56789"
                className="w-full bg-slate-800 border border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                All screened call transcripts & voice notes are forwarded here!
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Company / Business Name</span>
              </label>
              <input
                type="text"
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Jadhav Enterprises"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Profession / Designation</span>
              </label>
              <input
                type="text"
                value={formData.profession || ''}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                placeholder="e.g. Founder & Business Owner"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: AI Voice Assistant & Caller ID Personalization */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span>AI Caller Persona, Voice Tone & Greeting</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize how your AI Assistant introduces itself and speaks to inbound callers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                AI Assistant Name
              </label>
              <input
                type="text"
                value={formData.assistantPersonaName}
                onChange={(e) => setFormData({ ...formData, assistantPersonaName: e.target.value })}
                placeholder="e.g. Awaaz Priya AI / Aarav"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default AI Voice Profile
              </label>
              <select
                value={formData.assistantPersonaName.includes('Aarav') ? 'aarav_hi' : formData.assistantPersonaName.includes('Meera') ? 'meera_mr' : formData.assistantPersonaName.includes('Rohan') ? 'rohan_mr' : 'priya_hi'}
                onChange={(e) => {
                  soundEffects.playClick();
                  const selectedProfile = AI_VOICE_PROFILES.find((v) => v.id === e.target.value);
                  if (selectedProfile) {
                    setFormData({
                      ...formData,
                      assistantPersonaName: selectedProfile.name,
                      assistantVoiceGender: selectedProfile.gender,
                      preferredLanguage: selectedProfile.language,
                    });
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                {AI_VOICE_PROFILES.map((vp) => (
                  <option key={vp.id} value={vp.id}>
                    {vp.gender === 'female' ? '👩' : '👨'} {vp.name} ({vp.language.toUpperCase()} • {vp.tone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preferred Default Language
              </label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value as LanguageCode })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.nativeName} ({l.label})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Verified Caller ID Display
              </label>
              <input
                type="text"
                value={formData.callerIdName}
                onChange={(e) => setFormData({ ...formData, callerIdName: e.target.value })}
                placeholder="e.g. Prem Jadhav Assistant"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Spoken Greeting Customizer */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Custom Spoken Greeting for Inbound Callers:</span>
              </label>
              
              <button
                type="button"
                onClick={handleTestGreeting}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingGreeting ? 'animate-bounce text-indigo-400' : ''}`} />
                <span>{isPlayingGreeting ? 'Stop Voice' : 'Test Greeting Aloud'}</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={formData.customWelcomeGreeting}
              onChange={(e) => setFormData({ ...formData, customWelcomeGreeting: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
            />
          </div>
        </div>

        {/* SECTION 3: Do Not Disturb (DND) & Work Schedule */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Do Not Disturb (DND) & Quiet Hours Policy</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              During quiet hours, Equal AI automatically silences calls and rejects commercial telemarketers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quiet Hours Start Time
              </label>
              <input
                type="time"
                value={formData.dndStartHour}
                onChange={(e) => setFormData({ ...formData, dndStartHour: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quiet Hours End Time
              </label>
              <input
                type="time"
                value={formData.dndEndHour}
                onChange={(e) => setFormData({ ...formData, dndEndHour: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            <div className="pt-4 sm:pt-0">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.dndAutoRejectSpam}
                  onChange={(e) => setFormData({ ...formData, dndAutoRejectSpam: e.target.checked })}
                  className="rounded text-amber-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200">
                  Auto-Terminate All Spam & Sales Calls
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 4: App Design & Theme Styling */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span>Attractive App Theme & Visual Styling</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch between high-contrast dark-mode cyber themes with ambient glow lighting
              </p>
            </div>

            {formData.isFreeAccessGrantedByOwner && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 flex items-center gap-1.5 shadow-md">
                <Crown className="w-3.5 h-3.5" />
                100% Free Lifetime VIP Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: 'indigo', name: 'Cyber Sapphire', color: 'bg-indigo-600', border: 'border-indigo-500' },
              { id: 'emerald', name: 'Emerald Matrix', color: 'bg-emerald-500', border: 'border-emerald-500' },
              { id: 'amber', name: 'Royal Gold', color: 'bg-amber-400', border: 'border-amber-400' },
              { id: 'purple', name: 'Synthwave Purple', color: 'bg-purple-600', border: 'border-purple-500' },
              { id: 'cyan', name: 'Cyberpunk Cyan', color: 'bg-cyan-400', border: 'border-cyan-400' },
              { id: 'crimson', name: 'Ruby Crimson', color: 'bg-rose-500', border: 'border-rose-500' },
            ].map((theme) => {
              const isSelected = (formData.themeAccent || 'indigo') === theme.id;
              return (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setFormData({ ...formData, themeAccent: theme.id as ThemeAccent });
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? `${theme.border} bg-slate-800 shadow-lg ring-2 ring-indigo-400/30`
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-800/60'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg ${theme.color} mb-2 shadow-sm`} />
                  <div className="text-xs font-bold text-white leading-tight">{theme.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isSelected ? 'Active ✓' : 'Select'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: Security, Vault Encryption & Data Export */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>End-to-End Vault Encryption & Privacy Controls</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  AES-256 Vault Encryption
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                All scheduled calls, contact details, transcripts, and audio messages are encrypted locally before syncing.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  App Security 4-Digit PIN Lock
                </span>
                <input
                  type="checkbox"
                  checked={formData.pinEnabled}
                  onChange={(e) => setFormData({ ...formData, pinEnabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="4-digit PIN (e.g. 1234)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleExportData}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full Profile & Reminders JSON</span>
            </button>

            <span className="text-[10px] text-slate-500 font-mono">
              Last synced: {formData.lastSyncedAt ? new Date(formData.lastSyncedAt).toLocaleString() : 'Just now'}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile & AI Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
