import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  Crown, 
  Zap, 
  ShieldCheck, 
  Clock, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles,
  ArrowRight,
  Download,
  Gift,
  Tag,
  Percent,
  CheckCheck
} from 'lucide-react';
import { SubscriptionPlan, LanguageCode, UserProfile, AdminSettings, PaymentTransaction, PromoCoupon } from '../types';
import { soundEffects } from '../utils/speechVoice';

interface SubscriptionTabProps {
  currentLang: LanguageCode;
  profile: UserProfile;
  adminSettings: AdminSettings;
  plans: SubscriptionPlan[];
  onUpgradePlan: (
    planId: SubscriptionPlan['id'], 
    txRef: string, 
    method: PaymentTransaction['paymentMethod'],
    couponApplied?: string,
    amountPaid?: number
  ) => void;
  payments: PaymentTransaction[];
  onOpenAdmin?: () => void;
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  currentLang,
  profile,
  adminSettings,
  plans,
  onUpgradePlan,
  payments,
  onOpenAdmin,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(plans[1] || plans[0]); // Pro by default
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentTransaction['paymentMethod']>('upi_qr');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<PaymentTransaction | null>(null);

  // Promo Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<PromoCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Check if Current User has Free Access from Owner
  const matchingGrant = (adminSettings.freeAccessGrants || []).find(
    (g) => g.isActive && (
      (profile.email && g.userIdentifier.toLowerCase() === profile.email.toLowerCase()) ||
      (profile.phoneNumber && g.userIdentifier === profile.phoneNumber)
    )
  );

  const isUserGrantedFreeByOwner = 
    Boolean(profile.isFreeAccessGrantedByOwner) || 
    Boolean(matchingGrant) || 
    Boolean(adminSettings.globalFreeAccessEnabled);

  const grantedPlanTier = matchingGrant?.grantedPlan || profile.freeAccessPlan || adminSettings.globalFreePlanTier || 'business';

  // Calculate pricing considering global owner discount + coupon
  const calculatePlanPrice = (plan: SubscriptionPlan) => {
    if (isUserGrantedFreeByOwner) {
      return 0;
    }

    let price = plan.priceINR;

    // Apply global discount if active
    const globalDisc = adminSettings.activeGlobalDiscountPercent || 0;
    if (globalDisc > 0) {
      price = Math.round(price * (1 - globalDisc / 100));
    }

    // Apply applied coupon if present
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        const factor = Math.max(0, 1 - appliedCoupon.discountValue / 100);
        price = Math.round(price * factor);
      } else if (appliedCoupon.discountType === 'flat') {
        price = Math.max(0, price - appliedCoupon.discountValue);
      }
    }

    return Math.max(0, price);
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const targetCode = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError(null);

    if (!targetCode) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const availableCoupons = adminSettings.promoCoupons || [];
    const found = availableCoupons.find((c) => c.code.toUpperCase() === targetCode && c.isActive);

    if (found) {
      soundEffects.playSuccess();
      setAppliedCoupon(found);
      setCouponInput(found.code);
    } else {
      soundEffects.playClick();
      setCouponError(`Coupon "${targetCode}" is invalid or expired.`);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    soundEffects.playClick();
    setSelectedPlan(plan);

    const effectivePrice = calculatePlanPrice(plan);

    // If 100% Free (Granted by Owner or 100% Coupon), activate directly without UPI checkout!
    if (effectivePrice === 0 || isUserGrantedFreeByOwner) {
      handleInstantFreeActivation(plan);
      return;
    }

    setShowPaymentModal(true);
  };

  const handleInstantFreeActivation = (plan: SubscriptionPlan) => {
    soundEffects.playSuccess();
    const refCode = `FREE-VIP-${Date.now().toString().slice(-6)}`;
    const method: PaymentTransaction['paymentMethod'] = isUserGrantedFreeByOwner ? 'owner_free_grant' : 'promo_100';

    onUpgradePlan(plan.id, refCode, method, appliedCoupon?.code, 0);

    const receipt: PaymentTransaction = {
      id: 'tx_free_' + Date.now(),
      userEmail: profile.email,
      planId: plan.id,
      planName: plan.name,
      amountINR: 0,
      originalAmountINR: plan.priceINR,
      vpaAddress: `${adminSettings.ownerName} (Owner Free VIP Access)`,
      transactionRef: refCode,
      paymentMethod: method,
      status: 'success',
      date: new Date().toLocaleString(),
      customerName: profile.name,
      couponApplied: isUserGrantedFreeByOwner ? 'OWNER_VIP_PASS' : appliedCoupon?.code,
    };
    setSuccessReceipt(receipt);
  };

  const handleCopyVpa = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(adminSettings.ownerVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const currentFinalPrice = calculatePlanPrice(selectedPlan);
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(adminSettings.ownerVpa)}&pn=${encodeURIComponent(adminSettings.ownerName)}&am=${currentFinalPrice}&cu=INR&tn=${encodeURIComponent('AwaazAI ' + selectedPlan.name)}`;

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playClick();
    setIsProcessing(true);

    const generatedUtr = utrNumber.trim() || `UPI${Date.now().toString().slice(-8)}`;

    setTimeout(() => {
      setIsProcessing(false);
      soundEffects.playSuccess();
      onUpgradePlan(selectedPlan.id, generatedUtr, selectedMethod, appliedCoupon?.code, currentFinalPrice);

      const receipt: PaymentTransaction = {
        id: 'tx_' + Date.now(),
        userEmail: profile.email,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amountINR: currentFinalPrice,
        originalAmountINR: selectedPlan.priceINR,
        vpaAddress: adminSettings.ownerVpa,
        transactionRef: generatedUtr,
        paymentMethod: selectedMethod,
        status: 'success',
        date: new Date().toLocaleString(),
        customerName: profile.name,
        couponApplied: appliedCoupon?.code,
      };
      setSuccessReceipt(receipt);
      setShowPaymentModal(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* ========================================================================= */}
      {/* 1. OWNER 100% FREE ACCESS BANNER (IF ACTIVE FOR THIS USER) */}
      {/* ========================================================================= */}
      {isUserGrantedFreeByOwner && (
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-purple-500/20 border-2 border-amber-400 shadow-2xl shadow-amber-500/15">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-lg shadow-amber-400/30">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    👑 Owner Free VIP Pass Activated
                  </span>
                  <span className="text-xs font-mono text-emerald-300 font-bold">
                    Granted by {adminSettings.ownerName}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                  You Have Been Granted 100% Free Lifetime VIP Access!
                </h3>
                <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
                  All automated AI voice calls, WhatsApp auto-reminders, and spam call protection have been unlocked for your account with <strong className="text-amber-300">₹0 fees forever</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleInstantFreeActivation(plans[2] || plans[0])}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Re-Activate Free Business VIP (₹0)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {currentLang === 'hi' ? '2 दिन मुफ्त ट्रायल • मालिक का विशेष ऑफर व UPI पेमेंट' : currentLang === 'mr' ? '२ दिवस मोफत चाचणी • मालकाची खास ऑफर व UPI पेमेंट' : '2-Day Free Trial • Owner Direct UPI & Offers'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {currentLang === 'hi' ? 'सुलभ UPI भुगतान, ऑफर्स व फ्री VIP एक्सेस' : currentLang === 'mr' ? 'सोपे UPI पेमेंट, ऑफर्स व मोफत VIP एक्सेस' : 'Direct UPI Payment, Special Offers & VIP Passes'}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {currentLang === 'hi'
              ? `सभी भुगतान सीधे ऐप मालिक (${adminSettings.ownerName} • ${adminSettings.ownerVpa}) के खाते में ट्रांसफर होते हैं। मालिक द्वारा विशेष डिस्काउंट एवं फ्री कूपन भी मान्य हैं।`
              : currentLang === 'mr'
              ? `सर्व पेमेंट्स थेट ॲप मालक (${adminSettings.ownerName} • ${adminSettings.ownerVpa}) यांच्या खात्यात जमा होतात. मालकाकडून विशेष सवलती व कूपन्स उपलब्ध आहेत.`
              : `All subscription funds route directly into the verified bank account of ${adminSettings.ownerName}. Special owner discounts and free VIP promo codes can be applied below.`}
          </p>
        </div>

        {/* Current Status Pill */}
        <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl shrink-0 w-full md:w-auto text-left">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Current Account Tier</span>
          <div className="flex items-center gap-2 mt-1">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-lg font-extrabold text-white">
              {profile.isFreeAccessGrantedByOwner 
                ? '100% Free Lifetime VIP'
                : profile.subscriptionPlan === 'trial' 
                ? '2-Day Free Trial' 
                : profile.subscriptionPlan.toUpperCase() + ' Active'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-mono">
            Direct UPI to: {adminSettings.ownerVpa}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROMO COUPON & OWNER OFFER BAR */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-indigo-500/30 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Apply Promo Coupon or Owner VIP Code
              </h3>
              <p className="text-xs text-slate-400">
                Enter an owner coupon code to get instant flat discounts or 100% Free VIP access!
              </p>
            </div>
          </div>

          {adminSettings.activeGlobalDiscountPercent > 0 && !isUserGrantedFreeByOwner && (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
              🎉 {adminSettings.activeOfferBadgeText || `${adminSettings.activeGlobalDiscountPercent}% OFF ACTIVE`}
            </span>
          )}
        </div>

        {/* Coupon Input & Apply */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Enter coupon code (e.g. EQUAL50 or PREM100)"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                setCouponError(null);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono font-bold uppercase placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <button
            onClick={() => handleApplyCoupon()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            Apply Code
          </button>

          {appliedCoupon && (
            <button
              onClick={() => {
                soundEffects.playClick();
                setAppliedCoupon(null);
                setCouponInput('');
              }}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Remove
            </button>
          )}
        </div>

        {/* Quick click chips for active coupons */}
        {(adminSettings.promoCoupons || []).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-semibold text-slate-400">Owner Available Codes:</span>
            {adminSettings.promoCoupons.filter((c) => c.isActive).map((c) => (
              <button
                key={c.code}
                onClick={() => handleApplyCoupon(c.code)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-all border ${
                  appliedCoupon?.code === c.code
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-800 text-amber-300 border-amber-500/30 hover:bg-slate-700'
                }`}
              >
                🎟️ {c.code} ({c.discountValue === 100 ? '100% Free VIP' : `${c.discountValue}% OFF`})
              </button>
            ))}
          </div>
        )}

        {/* Error message */}
        {couponError && (
          <p className="text-xs text-rose-400 font-semibold animate-in fade-in">
            {couponError}
          </p>
        )}

        {/* Success Banner */}
        {appliedCoupon && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Coupon <strong>{appliedCoupon.code}</strong> applied successfully! {appliedCoupon.description} (
                {appliedCoupon.discountType === 'percentage'
                  ? `${appliedCoupon.discountValue}% Discount`
                  : `₹${appliedCoupon.discountValue} Cash Off`}
                )
              </span>
            </div>
            {appliedCoupon.discountValue === 100 && (
              <span className="font-extrabold text-amber-300 uppercase">100% Free Activated!</span>
            )}
          </div>
        )}
      </div>

      {/* Success Receipt Banner if activated */}
      {successReceipt && (
        <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-3xl p-6 shadow-xl animate-in fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {currentLang === 'hi' ? 'प्लान सक्रिय कर दिया गया है!' : currentLang === 'mr' ? 'प्लॅन ॲक्टिव्हेट झाला आहे!' : 'Plan Successfully Activated!'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Ref No: <span className="font-mono font-bold text-emerald-300">{successReceipt.transactionRef}</span> • Amount: ₹{successReceipt.amountINR} • Method: {successReceipt.paymentMethod}
                {successReceipt.couponApplied && ` • Coupon: ${successReceipt.couponApplied}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => soundEffects.playSuccess()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Invoice Receipt</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PRICING CARDS WITH DYNAMIC DISCOUNTS & FREE TOGGLE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = profile.subscriptionPlan === plan.id;
          const isPopular = plan.isPopular;

          const features = currentLang === 'mr' ? plan.featuresMr : currentLang === 'hi' ? plan.featuresHi : plan.features;
          const title = currentLang === 'mr' ? plan.nameMr : currentLang === 'hi' ? plan.nameHi : plan.name;
          const period = currentLang === 'mr' ? plan.billingPeriodMr : currentLang === 'hi' ? plan.billingPeriodHi : plan.billingPeriod;

          const effectivePrice = calculatePlanPrice(plan);
          const hasDiscount = effectivePrice < plan.priceINR;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                isPopular
                  ? 'bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-100 sm:scale-105 z-10'
                  : 'bg-slate-900/90 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                  Most Popular for India
                </div>
              )}

              {/* Discount / Free badge on card */}
              {isUserGrantedFreeByOwner ? (
                <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                  100% Free VIP
                </div>
              ) : hasDiscount ? (
                <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                  {effectivePrice === 0 ? '100% Free' : adminSettings.activeOfferBadgeText || 'Special Offer'}
                </div>
              ) : null}

              <div>
                <h3 className="text-xl font-bold text-white mt-1">{title}</h3>
                
                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className={`text-4xl font-extrabold ${effectivePrice === 0 ? 'text-emerald-400' : 'text-white'}`}>
                    ₹{effectivePrice}
                  </span>
                  
                  {hasDiscount && (
                    <span className="text-base text-slate-400 line-through">
                      ₹{plan.priceINR}
                    </span>
                  )}

                  <span className="text-xs text-slate-400 font-medium">/{period}</span>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  Includes {plan.callsLimit} AI calls & WhatsApp automation
                </p>

                <div className="my-6 border-t border-slate-800" />

                <ul className="space-y-3 text-xs text-slate-300">
                  {features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-bold text-xs"
                  >
                    ✓ Current Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                      effectivePrice === 0 || isUserGrantedFreeByOwner
                        ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 text-slate-950 shadow-amber-400/25 active:scale-95'
                        : isPopular
                        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {effectivePrice === 0 || isUserGrantedFreeByOwner ? (
                      <>
                        <Crown className="w-4 h-4" />
                        <span>Activate 100% Free VIP (₹0)</span>
                      </>
                    ) : (
                      <>
                        <span>Pay ₹{effectivePrice} via UPI</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. SECURE UPI CHECKOUT MODAL */}
      {/* ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 text-white">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Direct Owner UPI Gateway
                </span>
                <h3 className="text-xl font-bold text-white">
                  Pay ₹{currentFinalPrice} for {selectedPlan.name}
                </h3>
                {selectedPlan.priceINR > currentFinalPrice && (
                  <p className="text-xs text-emerald-400">
                    Discount applied: You save ₹{selectedPlan.priceINR - currentFinalPrice}!
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-5 pt-4">
              
              {/* Payment Method Selector */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { id: 'upi_qr', label: 'QR Code' },
                  { id: 'gpay', label: 'Google Pay' },
                  { id: 'phonepe', label: 'PhonePe' },
                  { id: 'paytm', label: 'Paytm/BHIM' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as any)}
                    className={`py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                      selectedMethod === m.id
                        ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* QR Code and Direct UPI Details */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
                <div className="inline-block p-3 bg-white rounded-2xl shadow-inner">
                  {/* Generated QR Code for UPI Intent */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(upiIntentUrl)}`}
                    alt="Direct UPI QR"
                    className="w-36 h-36 mx-auto object-contain"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">App Owner UPI VPA:</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="font-mono text-sm font-bold text-amber-300">
                      {adminSettings.ownerVpa}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyVpa}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Verified Merchant: {adminSettings.merchantName} ({adminSettings.ownerName})
                  </span>
                </div>

                <a
                  href={upiIntentUrl}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in UPI App (GPay / PhonePe)</span>
                </a>
              </div>

              {/* UTR Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  12-Digit UPI Transaction Ref / UTR Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 428190829102 (or leave empty for auto-generate)"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Verifying Transaction with Bank...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Activate Plan Immediately</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
