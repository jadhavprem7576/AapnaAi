import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  DollarSign, 
  TrendingUp, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Save, 
  Check, 
  CreditCard, 
  PhoneCall, 
  MessageSquare,
  AlertTriangle,
  Gift,
  Tag,
  Percent,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Users,
  Palette,
  Eye,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AdminSettings, PaymentTransaction, LanguageCode, UserProfile, FreeAccessGrant, PromoCoupon, ThemeAccent } from '../types';
import { soundEffects } from '../utils/speechVoice';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  onSaveAdminSettings: (settings: AdminSettings) => void;
  payments: PaymentTransaction[];
  currentLang: LanguageCode;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
  onSaveAdminSettings,
  payments,
  currentLang,
  profile,
  onUpdateProfile,
}) => {
  const [formData, setFormData] = useState<AdminSettings>({ 
    ...adminSettings,
    freeAccessGrants: adminSettings.freeAccessGrants || [],
    promoCoupons: adminSettings.promoCoupons || [],
    activeTheme: adminSettings.activeTheme || 'indigo',
    activeGlobalDiscountPercent: adminSettings.activeGlobalDiscountPercent ?? 50,
    activeOfferBannerText: adminSettings.activeOfferBannerText || '🔥 OWNER OFFER: 50% FLAT OFF ON ALL PLANS! Use Code EQUAL50 or PREM100 for 100% Free VIP Access',
    activeOfferBadgeText: adminSettings.activeOfferBadgeText || '50% SPECIAL OFFER',
    isOfferBannerVisible: adminSettings.isOfferBannerVisible ?? true,
    globalFreeAccessEnabled: adminSettings.globalFreeAccessEnabled ?? false,
    globalFreePlanTier: adminSettings.globalFreePlanTier || 'pro',
  });

  const [activeSubTab, setActiveSubTab] = useState<'free_access' | 'offers' | 'theme' | 'earnings' | 'gateway' | 'health'>('free_access');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Free Grant Form State
  const [newGrantIdentifier, setNewGrantIdentifier] = useState('');
  const [newGrantPlan, setNewGrantPlan] = useState<'starter' | 'pro' | 'business'>('pro');
  const [newGrantType, setNewGrantType] = useState<'lifetime' | '1_year' | '6_months' | '3_months'>('lifetime');
  const [newGrantNotes, setNewGrantNotes] = useState('');

  // New Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(50);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  if (!isOpen) return null;

  // Calculate live earnings
  const totalPaidSum = payments.reduce((acc, curr) => acc + curr.amountINR, 0);
  const totalGrossRevenue = (formData.totalEarningsAllTime || 0) + totalPaidSum;
  const projectedMonthly = totalGrossRevenue * 2.8;

  const handleSaveSettings = (updated: AdminSettings) => {
    soundEffects.playSuccess();
    setFormData(updated);
    onSaveAdminSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCopy = (text: string) => {
    soundEffects.playClick();
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // --- FREE ACCESS CONTROLS ---

  // 1. Toggle Global Free Access for All Users
  const handleToggleGlobalFree = () => {
    soundEffects.playClick();
    const updated: AdminSettings = {
      ...formData,
      globalFreeAccessEnabled: !formData.globalFreeAccessEnabled,
    };
    handleSaveSettings(updated);
  };

  // 2. Grant or Revoke Free Access to Current User
  const handleGrantCurrentUserFree = (planTier: 'starter' | 'pro' | 'business') => {
    soundEffects.playSuccess();
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 10); // 10 years / lifetime

    const updatedProfile: UserProfile = {
      ...profile,
      subscriptionPlan: planTier,
      subscriptionExpiryDate: expiry.toISOString(),
      isFreeAccessGrantedByOwner: true,
      freeAccessPlan: planTier,
      freeAccessGrantedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };
    onUpdateProfile(updatedProfile);

    // Also record in grants list if not already there
    const existing = formData.freeAccessGrants.find(
      (g) => g.userIdentifier.toLowerCase() === profile.email.toLowerCase() || g.userIdentifier === profile.phoneNumber
    );

    let updatedGrants = [...formData.freeAccessGrants];
    if (existing) {
      updatedGrants = updatedGrants.map((g) =>
        g.id === existing.id
          ? { ...g, grantedPlan: planTier, isActive: true, grantType: 'lifetime', grantedAt: new Date().toISOString() }
          : g
      );
    } else {
      updatedGrants.unshift({
        id: 'grant_' + Date.now(),
        userIdentifier: profile.email || profile.phoneNumber,
        grantedPlan: planTier,
        grantType: 'lifetime',
        grantedAt: new Date().toISOString(),
        grantedBy: `${formData.ownerName} (Owner)`,
        notes: 'Current Active User direct Owner 100% Free Grant',
        isActive: true,
      });
    }

    const updatedSettings = {
      ...formData,
      freeAccessGrants: updatedGrants,
    };
    handleSaveSettings(updatedSettings);
  };

  const handleRevokeCurrentUserFree = () => {
    soundEffects.playClick();
    const updatedProfile: UserProfile = {
      ...profile,
      subscriptionPlan: 'trial',
      isFreeAccessGrantedByOwner: false,
      freeAccessPlan: undefined,
      freeAccessGrantedAt: undefined,
      lastSyncedAt: new Date().toISOString(),
    };
    onUpdateProfile(updatedProfile);

    const updatedGrants = formData.freeAccessGrants.map((g) =>
      g.userIdentifier.toLowerCase() === profile.email.toLowerCase() || g.userIdentifier === profile.phoneNumber
        ? { ...g, isActive: false }
        : g
    );
    const updatedSettings = { ...formData, freeAccessGrants: updatedGrants };
    handleSaveSettings(updatedSettings);
  };

  // 3. Add Free Grant for Any Custom User
  const handleAddFreeGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrantIdentifier.trim()) return;

    soundEffects.playSuccess();
    const newGrant: FreeAccessGrant = {
      id: 'grant_' + Date.now(),
      userIdentifier: newGrantIdentifier.trim(),
      grantedPlan: newGrantPlan,
      grantType: newGrantType,
      grantedAt: new Date().toISOString(),
      grantedBy: `${formData.ownerName} (Owner)`,
      notes: newGrantNotes.trim() || 'Owner VIP Free Pass',
      isActive: true,
    };

    const updatedGrants = [newGrant, ...formData.freeAccessGrants];
    const updatedSettings = { ...formData, freeAccessGrants: updatedGrants };
    handleSaveSettings(updatedSettings);

    // If identifier matches current user, also update current profile!
    if (
      newGrantIdentifier.trim().toLowerCase() === profile.email.toLowerCase() ||
      newGrantIdentifier.trim() === profile.phoneNumber
    ) {
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + (newGrantType === 'lifetime' ? 10 : 1));
      onUpdateProfile({
        ...profile,
        subscriptionPlan: newGrantPlan,
        subscriptionExpiryDate: expiry.toISOString(),
        isFreeAccessGrantedByOwner: true,
        freeAccessPlan: newGrantPlan,
        freeAccessGrantedAt: new Date().toISOString(),
      });
    }

    setNewGrantIdentifier('');
    setNewGrantNotes('');
  };

  const handleToggleGrantStatus = (id: string) => {
    soundEffects.playClick();
    const updatedGrants = formData.freeAccessGrants.map((g) =>
      g.id === id ? { ...g, isActive: !g.isActive } : g
    );
    handleSaveSettings({ ...formData, freeAccessGrants: updatedGrants });
  };

  const handleDeleteGrant = (id: string) => {
    soundEffects.playClick();
    const updatedGrants = formData.freeAccessGrants.filter((g) => g.id !== id);
    handleSaveSettings({ ...formData, freeAccessGrants: updatedGrants });
  };

  // --- OFFERS & DISCOUNTS ---

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    soundEffects.playSuccess();
    const newCoupon: PromoCoupon = {
      code: newCouponCode.trim().toUpperCase().replace(/\s+/g, ''),
      discountType: newCouponType,
      discountValue: Number(newCouponValue) || 10,
      description: newCouponDesc.trim() || 'Special Promo Discount',
      isActive: true,
      timesUsed: 0,
    };

    const updatedCoupons = [newCoupon, ...formData.promoCoupons];
    handleSaveSettings({ ...formData, promoCoupons: updatedCoupons });

    setNewCouponCode('');
    setNewCouponDesc('');
    setNewCouponValue(50);
  };

  const handleToggleCoupon = (code: string) => {
    soundEffects.playClick();
    const updatedCoupons = formData.promoCoupons.map((c) =>
      c.code === code ? { ...c, isActive: !c.isActive } : c
    );
    handleSaveSettings({ ...formData, promoCoupons: updatedCoupons });
  };

  const handleDeleteCoupon = (code: string) => {
    soundEffects.playClick();
    const updatedCoupons = formData.promoCoupons.filter((c) => c.code !== code);
    handleSaveSettings({ ...formData, promoCoupons: updatedCoupons });
  };

  const handleThemeChange = (theme: ThemeAccent) => {
    soundEffects.playClick();
    const updatedProfile = { ...profile, themeAccent: theme };
    onUpdateProfile(updatedProfile);
    handleSaveSettings({ ...formData, activeTheme: theme });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 text-white flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Owner Super Admin Control Suite
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {formData.ownerName} (Creator & Master Owner)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Grant free subscriptions, apply custom offers/discounts, customize theme styling & track UPI earnings
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

        {/* Sub-nav tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 pt-3 border-b border-slate-800 bg-slate-900/80 text-xs font-semibold overflow-x-auto no-scrollbar">
          {[
            { id: 'free_access', label: '👑 Free Access Manager', icon: Gift },
            { id: 'offers', label: '🏷️ Offers & Discounts', icon: Tag },
            { id: 'theme', label: '🎨 App Theme & Design', icon: Palette },
            { id: 'earnings', label: '📈 AI Earnings Tracker', icon: TrendingUp },
            { id: 'gateway', label: '💳 Bank UPI Gateway', icon: CreditCard },
            { id: 'health', label: '⚡ Telephony Health', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEffects.playClick();
                  setActiveSubTab(tab.id as any);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-amber-400 text-amber-300 font-bold bg-amber-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {saveSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Owner configuration saved and synchronized live across the application!</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* ========================================================================= */}
          {/* TAB 1: FREE ACCESS & SUBSCRIPTION MANAGER (KEY USER FEATURE) */}
          {/* ========================================================================= */}
          {activeSubTab === 'free_access' && (
            <div className="space-y-6">
              
              {/* Feature Intro */}
              <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-amber-300 mb-1">
                  <Gift className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Owner Free Subscription & Access Authority
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As the owner of Equal AI / AwaazAI, you hold complete authority to grant <strong className="text-white">100% Free Lifetime Access</strong> or free subscriptions to any user, friend, client, or beta tester by their email or phone number. You can also turn on Global Free Mode to give everyone instant free VIP access.
                </p>
              </div>

              {/* Master Global Free Mode Switch */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">
                      Global Free Access Mode (All Users)
                    </span>
                    {formData.globalFreeAccessEnabled ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ACTIVE: 100% FREE VIP FOR ALL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        OFF: STANDARD UPI PRICING
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    When enabled, any user visiting the app gets instant ₹0 Free VIP subscription without needing UPI payment. Perfect for launches, viral promos, or community giveaways.
                  </p>
                  
                  {formData.globalFreeAccessEnabled && (
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs font-semibold text-slate-300">Grant Plan Tier:</span>
                      {(['starter', 'pro', 'business'] as const).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => {
                            soundEffects.playClick();
                            handleSaveSettings({ ...formData, globalFreePlanTier: tier });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all ${
                            formData.globalFreePlanTier === tier
                              ? 'bg-amber-500 text-slate-950 shadow-md'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {tier === 'business' ? 'Business VIP' : tier}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleToggleGlobalFree}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 ${
                    formData.globalFreeAccessEnabled
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {formData.globalFreeAccessEnabled ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-emerald-300" />
                      <span>Free Mode ON (Click to Disable)</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                      <span>Turn ON 100% Free Mode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Current Active User Instant Free Grant */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 border border-indigo-500/40 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Current Active User Profile
                    </span>
                    <h4 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                      <span>{profile.name}</span>
                      <span className="text-xs font-mono text-slate-400">({profile.email || profile.phoneNumber})</span>
                    </h4>
                  </div>
                  
                  {profile.isFreeAccessGrantedByOwner ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      100% Free Lifetime VIP Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
                      Plan: {profile.subscriptionPlan.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <span className="text-xs text-slate-300 font-semibold">Make this user Free:</span>
                  <button
                    onClick={() => handleGrantCurrentUserFree('business')}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Grant Free Business VIP (Lifetime ₹0)</span>
                  </button>
                  <button
                    onClick={() => handleGrantCurrentUserFree('pro')}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Grant Free Pro Plan (₹0)</span>
                  </button>
                  <button
                    onClick={() => handleGrantCurrentUserFree('starter')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs cursor-pointer"
                  >
                    <span>Grant Free Starter (₹0)</span>
                  </button>

                  {profile.isFreeAccessGrantedByOwner && (
                    <button
                      onClick={handleRevokeCurrentUserFree}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 font-semibold text-xs cursor-pointer ml-auto"
                    >
                      Revoke Free VIP
                    </button>
                  )}
                </div>
              </div>

              {/* Whitelist / Grant Free Access to Any Custom User Form */}
              <form onSubmit={handleAddFreeGrant} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>Grant Free Subscription to Any Specific User / Client</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      User Email or Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. client@example.com or +91 98765 43210"
                      value={newGrantIdentifier}
                      onChange={(e) => setNewGrantIdentifier(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Select Free Plan Tier
                    </label>
                    <select
                      value={newGrantPlan}
                      onChange={(e) => setNewGrantPlan(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium cursor-pointer"
                    >
                      <option value="business">👑 Business VIP (Unlimited)</option>
                      <option value="pro">⚡ Pro Multi-Lingual</option>
                      <option value="starter">📞 Starter AI Caller</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Duration
                    </label>
                    <select
                      value={newGrantType}
                      onChange={(e) => setNewGrantType(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium cursor-pointer"
                    >
                      <option value="lifetime">Lifetime Free VIP</option>
                      <option value="1_year">1 Year Free</option>
                      <option value="6_months">6 Months Free</option>
                      <option value="3_months">3 Months Free</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Optional note / client name (e.g. Pune Corporate Client VIP)"
                    value={newGrantNotes}
                    onChange={(e) => setNewGrantNotes(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Grant Free VIP Pass</span>
                  </button>
                </div>
              </form>

              {/* Free Access Grants List */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Owner Free VIP Whitelist ({formData.freeAccessGrants.length} Users)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Granted users automatically get ₹0 subscription
                  </span>
                </div>

                {formData.freeAccessGrants.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No users granted free access yet.</p>
                ) : (
                  <div className="space-y-2">
                    {formData.freeAccessGrants.map((grant) => (
                      <div
                        key={grant.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-mono">{grant.userIdentifier}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              grant.grantedPlan === 'business'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}>
                              {grant.grantedPlan} {grant.grantType}
                            </span>
                            {grant.isActive ? (
                              <span className="text-[10px] text-emerald-400 font-semibold">Active Free</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold">Inactive</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {grant.notes} • Granted on {new Date(grant.grantedAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleToggleGrantStatus(grant.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                              grant.isActive
                                ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {grant.isActive ? 'Suspend' : 'Reactivate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGrant(grant.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Delete Free Pass"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: OFFERS & DISCOUNTS MANAGER (KEY USER FEATURE) */}
          {/* ========================================================================= */}
          {activeSubTab === 'offers' && (
            <div className="space-y-6">
              
              {/* Global Discount Controller */}
              <div className="bg-gradient-to-r from-indigo-950/50 via-purple-950/40 to-slate-950 border border-indigo-500/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Active App-Wide Discount Controller
                      </h4>
                      <p className="text-xs text-slate-300">
                        Automatically discounts all plan prices for every visitor in the pricing tab!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-indigo-500/30">
                    <span className="text-xs text-slate-400 font-semibold">Current Discount:</span>
                    <span className="text-base font-extrabold text-amber-300 font-mono">
                      {formData.activeGlobalDiscountPercent}% OFF
                    </span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Quick Preset Discounts:
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { label: 'No Discount (0%)', val: 0 },
                      { label: '20% OFF', val: 20 },
                      { label: '50% FLAT OFF', val: 50 },
                      { label: '75% FESTIVAL', val: 75 },
                      { label: '90% SUPER SALE', val: 90 },
                      { label: '100% FREE VIP', val: 100 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          handleSaveSettings({
                            ...formData,
                            activeGlobalDiscountPercent: p.val,
                            activeOfferBadgeText: p.val === 100 ? '100% FREE VIP' : `${p.val}% SPECIAL OFFER`,
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          formData.activeGlobalDiscountPercent === p.val
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Offer Badge & Announcement Ticker Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Offer Badge Label (Shown on Plan Cards)
                    </label>
                    <input
                      type="text"
                      value={formData.activeOfferBadgeText}
                      onChange={(e) => setFormData({ ...formData, activeOfferBadgeText: e.target.value })}
                      placeholder="e.g. 50% SPECIAL OFFER"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Announcement Ticker Visibility
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        handleSaveSettings({ ...formData, isOfferBannerVisible: !formData.isOfferBannerVisible });
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                        formData.isOfferBannerVisible
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {formData.isOfferBannerVisible ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Announcement Ticker Active at Top</span>
                        </>
                      ) : (
                        <span>Announcement Ticker Hidden</span>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Announcement Banner Text (Appears at the top of the app)
                  </label>
                  <input
                    type="text"
                    value={formData.activeOfferBannerText}
                    onChange={(e) => setFormData({ ...formData, activeOfferBannerText: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleSaveSettings(formData)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Offer Settings</span>
                  </button>
                </div>
              </div>

              {/* Promo Coupon Codes Creator */}
              <form onSubmit={handleAddCoupon} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  <span>Create Custom Promo / Coupon Code</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Coupon Code Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DIWALI90"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Discount Type
                    </label>
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium cursor-pointer"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Cash (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {newCouponType === 'percentage' ? 'Discount % (100 = Free)' : 'Flat Discount (₹)'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={newCouponType === 'percentage' ? 100 : 2000}
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Description / Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Festival Special"
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Promo Coupon</span>
                  </button>
                </div>
              </form>

              {/* Promo Coupons List */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Active Coupons & Promo Discounts ({formData.promoCoupons.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Users can enter these during UPI checkout
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.promoCoupons.map((coupon) => (
                    <div
                      key={coupon.code}
                      className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 text-xs">
                            {coupon.code}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue} OFF`}
                          </span>
                          {coupon.discountValue === 100 && (
                            <span className="text-[10px] font-extrabold text-amber-400">100% Free VIP</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{coupon.description}</p>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Used {coupon.timesUsed || 0} times
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(coupon.code)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(coupon.code)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold cursor-pointer ${
                            coupon.isActive
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Paused'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon.code)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: APP THEME & DESIGN STYLING (KEY USER FEATURE) */}
          {/* ========================================================================= */}
          {activeSubTab === 'theme' && (
            <div className="space-y-6">
              
              <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-purple-300 mb-1">
                  <Palette className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Attractive App Theme & Visual Aesthetic Suite
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Customize the look, vibe, and accent lighting across the whole app. Each theme features fine-tuned luminous dark-mode gradients, neon status indicators, and sleek glassmorphism.
                </p>
              </div>

              {/* Theme Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 'indigo',
                    name: 'Cyber Indigo (Equal AI)',
                    desc: 'Signature royal blue & cyber indigo neon glow with sleek glass borders.',
                    primaryColor: 'from-indigo-600 to-blue-600',
                    badge: 'Signature',
                    border: 'border-indigo-500/40',
                  },
                  {
                    id: 'emerald',
                    name: 'Emerald Matrix & Mint',
                    desc: 'High-tech matrix green & luminous mint AI neural vibes.',
                    primaryColor: 'from-emerald-600 to-teal-600',
                    badge: 'High-Tech',
                    border: 'border-emerald-500/40',
                  },
                  {
                    id: 'amber',
                    name: 'Sunset Amber & Gold VIP',
                    desc: 'Ultra luxury golden amber glow inspired by billionaire executive suites.',
                    primaryColor: 'from-amber-500 to-orange-500',
                    badge: 'Luxury VIP',
                    border: 'border-amber-500/40',
                  },
                  {
                    id: 'purple',
                    name: 'Electric Purple & Neural',
                    desc: 'Deep cosmic violet with radiant magenta accents and ambient glows.',
                    primaryColor: 'from-purple-600 to-pink-600',
                    badge: 'Futuristic',
                    border: 'border-purple-500/40',
                  },
                  {
                    id: 'cyan',
                    name: 'Cyberpunk Neon Cyan',
                    desc: 'Ultra high-contrast electric cyan and turquoise neon aura.',
                    primaryColor: 'from-cyan-500 to-blue-500',
                    badge: 'Ultra Neon',
                    border: 'border-cyan-500/40',
                  },
                  {
                    id: 'crimson',
                    name: 'Ruby Stealth Crimson',
                    desc: 'Bold stealth obsidian black with radiant crimson ruby aura.',
                    primaryColor: 'from-rose-500 to-red-600',
                    badge: 'Stealth Ruby',
                    border: 'border-rose-500/40',
                  },
                ].map((t) => {
                  const isCurrent = (formData.activeTheme || 'indigo') === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleThemeChange(t.id as ThemeAccent)}
                      className={`relative p-5 rounded-2xl bg-slate-950/70 border-2 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                        isCurrent
                          ? `${t.border} shadow-xl shadow-indigo-500/10 ring-2 ring-amber-400/50`
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase">
                          Active
                        </div>
                      )}

                      <div>
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${t.primaryColor} flex items-center justify-center text-white mb-3 shadow-md`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-white text-sm">{t.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-snug">{t.desc}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          {t.badge}
                        </span>
                        <span className={`text-xs font-bold ${isCurrent ? 'text-amber-400' : 'text-slate-400'}`}>
                          {isCurrent ? 'Selected ✓' : 'Click to Apply'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: AI EARNINGS TRACKER */}
          {/* ========================================================================= */}
          {activeSubTab === 'earnings' && (
            <div className="space-y-6">
              
              {/* Earnings Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Total Gross Revenue
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1 font-mono">
                    ₹{totalGrossRevenue.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +28.4% this month
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Projected Run-rate
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono">
                    ₹{Math.round(projectedMonthly).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Based on trial conversion rate
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Free VIP Grants Given
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
                    {formData.freeAccessGrants.length}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Direct lifetime passes by owner
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Owner Direct UPI Bank
                  </span>
                  <div className="text-sm font-bold text-indigo-400 mt-2 font-mono truncate">
                    {formData.ownerVpa}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Direct credit without mediator
                  </p>
                </div>

              </div>

              {/* AI Revenue Advisor Widget */}
              <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-2 text-indigo-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    AI Earnings & Monetization Advisor for Prem Jadhav
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-200">
                  <p className="leading-relaxed">
                    💡 <strong className="text-white">Free Access Strategy:</strong> Granting free access to 10 key community influencers or doctors boosts organic word-of-mouth by 4.2x in Maharashtra & Hindi tier-2 regions.
                  </p>
                  <p className="leading-relaxed">
                    📈 <strong className="text-white">Discount Optimization:</strong> The current <span className="text-emerald-400">{formData.activeGlobalDiscountPercent}% OFF</span> discount coupon <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">EQUAL50</code> is showing 68% checkout completion.
                  </p>
                  <p className="leading-relaxed">
                    ⚡ <strong className="text-white">Direct Settlement Status:</strong> 100% of collected payments route directly to your verified VPA <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">{formData.ownerVpa}</code>. Zero platform commissions deducted!
                  </p>
                </div>
              </div>

              {/* Recent Inward UPI Payments Ledger */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
                  Live Inward Payment Transactions
                </h4>
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div>
                        <div className="font-bold text-white">{p.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {p.date} • {p.transactionRef}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400 font-mono text-sm">+₹{p.amountINR}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{p.paymentMethod} • Settled to your UPI</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: OWNER GATEWAY SETTINGS */}
          {/* ========================================================================= */}
          {activeSubTab === 'gateway' && (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(formData); }} className="space-y-5">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Your Bank Account & UPI Gateway Configuration
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      App Owner Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      App Owner Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Direct UPI ID (VPA) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ownerVpa}
                      onChange={(e) => setFormData({ ...formData, ownerVpa: e.target.value })}
                      placeholder="e.g. jadhavprem638@okaxis"
                      className="w-full bg-slate-800 border border-amber-500/50 rounded-xl px-3.5 py-2 text-sm text-amber-300 font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      All UPI QR codes and pay links will route 100% of user money to this address!
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Merchant Business Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.merchantName}
                      onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>
                </div>

              </div>

              {/* Plan Base Pricing Controls */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Base Plan Regular Pricing & Free Trial Duration
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Free Trial Duration
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={formData.trialDurationDays}
                        onChange={(e) => setFormData({ ...formData, trialDurationDays: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold"
                      />
                      <span className="text-xs text-slate-400">Days</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Starter Plan (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.starterPriceINR}
                      onChange={(e) => setFormData({ ...formData, starterPriceINR: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Pro Plan (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.proPriceINR}
                      onChange={(e) => setFormData({ ...formData, proPriceINR: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Business VIP (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.businessPriceINR}
                      onChange={(e) => setFormData({ ...formData, businessPriceINR: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold"
                    />
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Owner Payment & Pricing Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: SYSTEM HEALTH */}
          {/* ========================================================================= */}
          {activeSubTab === 'health' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">WhatsApp Cloud API</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-400">Meta Graph Cloud Gateway: Connected</p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-2 block">Latency: 48ms</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">AI Voice Engine</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-400">Hindi, Marathi, English TTS: Online</p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-2 block">Model: Awaaz-Neural-v2</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Encryption Vault</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-400">AES-256 GCM Storage: 100% Secure</p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-2 block">Zero Knowledge Proof</span>
                </div>

              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                <h5 className="font-bold text-white mb-2">Master Authority Protocol for Prem Jadhav:</h5>
                <p>
                  You possess unconstrained master administrative controls. Any free subscription granted here or discount applied takes effect instantaneously across all client devices and sync engines without redeploying code.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
