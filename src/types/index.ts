export type LanguageCode = 'hi' | 'mr' | 'en' | 'gu' | 'ta' | 'te' | 'bn' | 'pa';

export type VoiceTone = 'empathetic' | 'professional' | 'friendly' | 'respectful' | 'energetic';

export type CallStatus = 
  | 'scheduled'
  | 'calling'
  | 'completed'
  | 'no_answer'
  | 'sms_fallback_sent'
  | 'whatsapp_fallback_sent'
  | 'failed'
  | 'cancelled';

export type FallbackOption = 
  | 'call_then_whatsapp' 
  | 'call_then_sms' 
  | 'call_then_both' 
  | 'direct_whatsapp' 
  | 'direct_sms';

export interface AiVoiceProfile {
  id: string;
  name: string;
  nameNative: string;
  gender: 'female' | 'male';
  language: LanguageCode;
  tone: VoiceTone;
  personaTitle: string;
  accent: string;
  pitch: number;
  rate: number;
  sampleGreeting: string;
  sampleGreetingHi?: string;
  sampleGreetingMr?: string;
  isUniversal?: boolean;
  isStarkAi?: boolean;
  geminiVoice?: 'Charon' | 'Fenrir' | 'Kore' | 'Puck' | 'Zephyr';
}

export interface ScheduledReminder {
  id: string;
  contactName: string;
  phoneNumber: string;
  scheduledDateTime: string; // ISO string
  language: LanguageCode;
  voiceId?: string;
  voiceTone: VoiceTone;
  callGoal: string; // e.g. "Medicine reminder & wishing good health"
  customScript: string; // What the AI says
  fallbackOption: FallbackOption;
  whatsappMessage: string;
  smsMessage: string;
  retryOnNoAnswer: boolean;
  maxRetries: number;
  retryIntervalMinutes: number;
  status: CallStatus;
  createdAt: string;
  lastAttemptAt?: string;
  recurrence?: 'once' | 'daily' | 'weekly' | 'custom';
  whatsappDeliveryStatus?: 'pending' | 'sent' | 'read';
  priority?: 'high' | 'normal' | 'urgent';
  category?: 'medicine_health' | 'meeting' | 'birthday_wish' | 'payment' | 'general';
  callOutcomeNotes?: string;
  durationSeconds?: number;
  recordingPlayed?: boolean;
}

export type ThemeAccent = 'indigo' | 'emerald' | 'amber' | 'purple' | 'cyan' | 'crimson';

export interface FreeAccessGrant {
  id: string;
  userIdentifier: string; // email or phone number
  grantedPlan: 'starter' | 'pro' | 'business';
  grantType: 'lifetime' | '1_year' | '6_months' | '3_months';
  grantedAt: string;
  grantedBy: string;
  notes?: string;
  isActive: boolean;
}

export interface PromoCoupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number; // e.g. 50 (50% off) or 100 (100% free / ₹100 flat)
  description: string;
  validUntil?: string;
  isActive: boolean;
  timesUsed: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  whatsappNotificationNumber: string;
  callerIdName: string;
  companyName?: string;
  profession?: string;
  avatarIcon?: string;
  preferredLanguage: LanguageCode;
  assistantPersonaName: string;
  assistantVoiceGender: 'female' | 'male';
  customWelcomeGreeting: string;
  dndStartHour: string;
  dndEndHour: string;
  dndAutoRejectSpam: boolean;
  pinCode: string;
  pinEnabled: boolean;
  encryptionActive: boolean;
  autoSyncEnabled: boolean;
  lastSyncedAt: string;
  trialStartDate: string; // ISO string (default 2 days)
  trialDurationDays: number;
  subscriptionPlan: 'trial' | 'starter' | 'pro' | 'business';
  subscriptionExpiryDate: string;
  isAdmin: boolean;
  upiId?: string;
  isFreeAccessGrantedByOwner?: boolean;
  freeAccessPlan?: 'starter' | 'pro' | 'business';
  freeAccessGrantedAt?: string;
  themeAccent?: ThemeAccent;
}

export interface SubscriptionPlan {
  id: 'starter' | 'pro' | 'business';
  name: string;
  nameHi: string;
  nameMr: string;
  priceINR: number;
  billingPeriod: string;
  billingPeriodHi: string;
  billingPeriodMr: string;
  features: string[];
  featuresHi: string[];
  featuresMr: string[];
  isPopular?: boolean;
  callsLimit: number;
  whatsappLimit: number;
}

export interface PaymentTransaction {
  id: string;
  userEmail: string;
  planId: string;
  planName: string;
  amountINR: number;
  vpaAddress: string;
  transactionRef: string;
  paymentMethod: 'upi_qr' | 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'owner_free_grant' | 'promo_100';
  status: 'success' | 'pending' | 'verified';
  date: string;
  customerName: string;
  couponApplied?: string;
  originalAmountINR?: number;
}

export interface ScreenedCall {
  id: string;
  callerName: string;
  callerNumber: string;
  callerType: 'verified' | 'suspected_spam' | 'telemarketer' | 'fraud_scam' | 'vip' | 'delivery';
  spamScore: number; // 0 - 100
  status: 'ringing' | 'ai_screening' | 'user_joined' | 'blocked' | 'silenced' | 'completed';
  actionTaken?: 'auto_blocked' | 'silenced' | 'forwarded_whatsapp' | 'call_taken' | 'screened_normal';
  screeningTranscript: Array<{
    id: string;
    speaker: 'caller' | 'ai_assistant' | 'user';
    text: string;
    time: string;
  }>;
  aiSummary: string;
  recordingDurationSec: number;
  language: LanguageCode;
  timestamp: string;
  hasAudioRecording: boolean;
  notes?: string;
}

export interface EqualAiSettings {
  aiFirstResponseEnabled: boolean; // "If anyone calls you, firstly your AI assistant receives your call and talks"
  autoBlockFraud: boolean; // Auto-blocks spam/scam calls
  silentCompanyTelemarketers: boolean; // Silences sales/telemarketing
  notifyLiveChat: boolean; // Live chat conversation view while AI is talking
  sendSummaryToWhatsApp: boolean; // Live WhatsApp dispatch
  greetingLanguage: LanguageCode;
  screeningSensitivity: 'standard' | 'strict' | 'aggressive';
  selectedVoiceId?: string;
}

export interface AdminSettings {
  ownerName: string;
  ownerEmail: string;
  ownerVpa: string; // UPI ID (e.g., jadhavprem638@okaxis)
  merchantName: string;
  customQrUrl?: string;
  trialDurationDays: number;
  starterPriceINR: number;
  proPriceINR: number;
  businessPriceINR: number;
  encryptionAlgorithm: string;
  autoSyncIntervalSec: number;
  whatsappGatewayActive: boolean;
  smsGatewayActive: boolean;
  totalEarningsAllTime: number;

  // Owner Super Admin Controls: Free Subscription & User Free Access
  globalFreeAccessEnabled: boolean; // Owner toggle to make all subscriptions 100% free for everyone
  globalFreePlanTier: 'starter' | 'pro' | 'business';
  freeAccessGrants: FreeAccessGrant[]; // Whitelisted users with free access granted by owner

  // Owner Custom Offer & Discount Manager
  activeGlobalDiscountPercent: number; // e.g. 0%, 50%, 75% off on all plans
  activeOfferBannerText: string;
  isOfferBannerVisible: boolean;
  activeOfferBadgeText: string;
  promoCoupons: PromoCoupon[];

  // App Theme & Styling
  activeTheme: ThemeAccent;
}
