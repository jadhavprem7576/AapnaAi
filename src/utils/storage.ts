import { 
  ScheduledReminder, 
  UserProfile, 
  AdminSettings, 
  PaymentTransaction, 
  SubscriptionPlan, 
  ScreenedCall, 
  EqualAiSettings,
  PromoCoupon,
  FreeAccessGrant,
  ThemeAccent
} from '../types';

const STORAGE_KEYS = {
  REMINDERS: 'awaaz_reminders_v1',
  PROFILE: 'awaaz_profile_v1',
  ADMIN_SETTINGS: 'awaaz_admin_settings_v1',
  PAYMENTS: 'awaaz_payments_v1',
  SCREENED_CALLS: 'awaaz_screened_calls_v1',
  EQUAL_AI_SETTINGS: 'awaaz_equal_ai_settings_v1',
};

// Default owner details from user metadata
export const DEFAULT_OWNER_EMAIL = 'jadhavprem638@gmail.com';
export const DEFAULT_OWNER_NAME = 'Prem Jadhav';
export const DEFAULT_OWNER_VPA = 'jadhavprem638@okaxis';

export const INITIAL_PROMO_COUPONS: PromoCoupon[] = [
  {
    code: 'PREM100',
    discountType: 'percentage',
    discountValue: 100, // 100% Free VIP
    description: 'Owner Special: 100% Free VIP Lifetime Access',
    isActive: true,
    timesUsed: 14,
  },
  {
    code: 'EQUAL50',
    discountType: 'percentage',
    discountValue: 50,
    description: '50% Flat Launch Discount on All Plans',
    isActive: true,
    timesUsed: 89,
  },
  {
    code: 'DIWALI75',
    discountType: 'percentage',
    discountValue: 75,
    description: 'Festival Bonanza: 75% OFF + Free WhatsApp Gateway',
    isActive: true,
    timesUsed: 42,
  },
  {
    code: 'FLAT100',
    discountType: 'flat',
    discountValue: 100,
    description: 'Flat ₹100 instant discount on any plan',
    isActive: true,
    timesUsed: 106,
  },
];

export const INITIAL_FREE_ACCESS_GRANTS: FreeAccessGrant[] = [
  {
    id: 'grant_1',
    userIdentifier: 'jadhavprem638@gmail.com',
    grantedPlan: 'business',
    grantType: 'lifetime',
    grantedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    grantedBy: 'Prem Jadhav (Owner Master)',
    notes: 'App Owner & Creator Master Lifetime VIP',
    isActive: true,
  },
  {
    id: 'grant_2',
    userIdentifier: '+91 98234 56789',
    grantedPlan: 'business',
    grantType: 'lifetime',
    grantedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    grantedBy: 'Prem Jadhav (Owner)',
    notes: 'Primary Phone Number VIP Access Pass',
    isActive: true,
  },
  {
    id: 'grant_3',
    userIdentifier: 'vip_client@awaaz.ai',
    grantedPlan: 'pro',
    grantType: '1_year',
    grantedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    grantedBy: 'Prem Jadhav (Owner)',
    notes: 'Early Beta Adopter 1-Year Free Pro Pass',
    isActive: true,
  },
];

export const INITIAL_ADMIN_SETTINGS: AdminSettings = {
  ownerName: DEFAULT_OWNER_NAME,
  ownerEmail: DEFAULT_OWNER_EMAIL,
  ownerVpa: DEFAULT_OWNER_VPA,
  merchantName: 'Awaaz AI Voice Technologies',
  customQrUrl: '',
  trialDurationDays: 2,
  starterPriceINR: 199,
  proPriceINR: 499,
  businessPriceINR: 999,
  encryptionAlgorithm: 'AES-256-GCM + End-to-End Vault',
  autoSyncIntervalSec: 10,
  whatsappGatewayActive: true,
  smsGatewayActive: true,
  totalEarningsAllTime: 24950,

  // Owner Free Access Controls
  globalFreeAccessEnabled: false,
  globalFreePlanTier: 'pro',
  freeAccessGrants: INITIAL_FREE_ACCESS_GRANTS,

  // Owner Offers & Discounts
  activeGlobalDiscountPercent: 50,
  activeOfferBannerText: '🔥 OWNER OFFER: 50% FLAT OFF ON ALL PLANS! Use Code EQUAL50 or PREM100 for 100% Free VIP Access',
  isOfferBannerVisible: true,
  activeOfferBadgeText: '50% SPECIAL OFFER',
  promoCoupons: INITIAL_PROMO_COUPONS,

  // Theme Accent
  activeTheme: 'indigo',
};

export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter AI Caller',
    nameHi: 'स्टार्टर AI कॉलर',
    nameMr: 'स्टार्टर AI कॉलर',
    priceINR: 199,
    billingPeriod: 'per month',
    billingPeriodHi: 'प्रति माह',
    billingPeriodMr: 'दर महा',
    features: [
      '50 Automated AI Calls / month',
      'Hindi, Marathi & English Natural Voice',
      'Automatic SMS Fallback on No Answer',
      'End-to-End Encrypted Data',
      'Standard Scheduling',
    ],
    featuresHi: [
      '५० ऑटोमेटेड AI कॉल्स / महीना',
      'हिंदी, मराठी आणि इंग्लिश नैसर्गिक आवाज',
      'कॉल न उचलल्यास त्वरित SMS फॉलबॅक',
      'AES-256 एनक्रिप्टेड सुरक्षित डेटा',
      'साधे शेड्यूलिंग',
    ],
    featuresMr: [
      '५० ऑटोमेटेड AI कॉल्स / महिना',
      'मराठी, हिंदी व इंग्लिश नैसर्गिक आवाज',
      'कॉल न उचलल्यास त्वरित SMS फॉलबॅक',
      'पूर्णपणे एनक्रिप्टेड सुरक्षित डेटा',
      'सुलभ शेड्यूलिंग',
    ],
    callsLimit: 50,
    whatsappLimit: 50,
  },
  {
    id: 'pro',
    name: 'Pro Multi-Lingual Caller & WhatsApp',
    nameHi: 'प्रो AI कॉलर व व्हॉट्सॲप',
    nameMr: 'प्रो AI कॉलर व व्हॉट्सॲप',
    priceINR: 499,
    billingPeriod: 'per month',
    billingPeriodHi: 'प्रति माह',
    billingPeriodMr: 'दर महा',
    isPopular: true,
    features: [
      '250 Automated AI Calls / month',
      'WhatsApp Auto-Fallback + SMS Failover',
      'Deep Hindi, Marathi & English Emotional Intelligence',
      'Custom Caller ID Branding',
      'Auto-Retry 3 Times if Unanswered',
      'Real-Time Call Transcripts & Audio Playback',
    ],
    featuresHi: [
      '२५० ऑटोमेटेड AI कॉल्स / महीना',
      'कॉल न उचलल्यास त्वरित व्हॉट्सॲप + SMS',
      'अत्यंत सकारात्मक आणि विचारपूर्वक संभाषण (Hindi/Marathi)',
      'कस्टम कॉलर आयडी ब्रँडिंग',
      'अनुत्तरित असल्यास ३ वेळा ऑटो-रीट्राय',
      'कॉल ट्रान्सक्रिप्ट व ऑडिओ रेकॉर्डिंग',
    ],
    featuresMr: [
      '२५० ऑटोमेटेड AI कॉल्स / महिना',
      'कॉल न उचलल्यास आपोआप व्हॉट्सॲप + SMS',
      'सकारात्मक आणि आदरयुक्त संवाद शैली',
      'स्वतःचा कॉलर आयडी नाव',
      'कॉल न उचलल्यास ३ वेळा रीट्राय',
      'लाईव्ह कॉल ट्रान्सक्रिप्ट व रेकॉर्डिंग',
    ],
    callsLimit: 250,
    whatsappLimit: 250,
  },
  {
    id: 'business',
    name: 'Business VIP Unlimited',
    nameHi: 'बिजनेस VIP अनलिमिटेड',
    nameMr: 'बिझनेस VIP अनलिमिटेड',
    priceINR: 999,
    billingPeriod: 'per month',
    billingPeriodHi: 'प्रति माह',
    billingPeriodMr: 'दर महा',
    features: [
      'Unlimited AI Calls & Smart Reminders',
      'Priority WhatsApp Meta Cloud API Delivery',
      'Bulk Excel/CSV Contact Upload',
      'Dedicated Admin Analytics Dashboard',
      '24/7 VIP Phone Support',
      'Custom Multi-dialect Voice Training',
    ],
    featuresHi: [
      'अनलिमिटेड AI कॉल्स व स्मरणपत्रे',
      'हाय-स्पीड व्हॉट्सॲप मेटा क्लाउड डिलिव्हरी',
      'एक्सेल शीट द्वारे बल्क कॉन्टॅक्ट अपलोड',
      'समर्पित अर्निंग्स व ॲडमिन डॅशबोर्ड',
      '२४/७ व्हीआयपी सपोर्ट',
      'कस्टम स्थानिक भाषा आवाज पर्याय',
    ],
    featuresMr: [
      'अमर्याद AI कॉल्स व स्मरणपत्रे',
      'अतिजलद व्हॉट्सॲप क्लाउड डिलिव्हरी',
      'एक्सेल द्वारे अनेक लोकांचे नंबर एकाच वेळी जोडा',
      'तपशीलवार बिझनेस डॅशबोर्ड',
      '२४/७ व्हीआयपी सपोर्ट',
      'कस्टम आवाज व उच्चार पर्याय',
    ],
    callsLimit: 9999,
    whatsappLimit: 9999,
  },
];


// Initial profile with 2-day free trial from right now
export function getInitialProfile(): UserProfile {
  const now = new Date();
  const trialExpiry = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 48 hours

  return {
    name: 'Prem Jadhav',
    email: DEFAULT_OWNER_EMAIL,
    phoneNumber: '+91 98234 56789',
    alternatePhoneNumber: '+91 98234 56780',
    whatsappNotificationNumber: '+91 98234 56789',
    callerIdName: 'Prem Jadhav AI Voice',
    companyName: 'Jadhav Enterprises & Tech',
    profession: 'Business Owner & Founder',
    avatarIcon: '👑',
    preferredLanguage: 'hi',
    assistantPersonaName: 'Awaaz Priya AI',
    assistantVoiceGender: 'female',
    customWelcomeGreeting: 'नमस्ते! मैं प्रेम जाधव जी का AI असिस्टेंट बोल रहा हूँ। आप कौन बोल रहे हैं और किस विषय में कॉल किया है?',
    dndStartHour: '22:00',
    dndEndHour: '08:00',
    dndAutoRejectSpam: true,
    pinCode: '1234',
    pinEnabled: false,
    encryptionActive: true,
    autoSyncEnabled: true,
    lastSyncedAt: new Date().toISOString(),
    trialStartDate: now.toISOString(),
    trialDurationDays: 2,
    subscriptionPlan: 'trial',
    subscriptionExpiryDate: trialExpiry.toISOString(),
    isAdmin: true,
    upiId: DEFAULT_OWNER_VPA,
  };
}

export function getInitialReminders(): ScheduledReminder[] {
  const now = new Date();
  const todayAfternoon = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
  const tomorrowMorning = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const pastOneHour = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'rem_1',
      contactName: 'राहुल पाटील (Rahul Patil)',
      phoneNumber: '+91 98765 43210',
      scheduledDateTime: todayAfternoon,
      language: 'mr',
      voiceId: 'rohan_mr',
      voiceTone: 'empathetic',
      callGoal: 'प्रोजेक्ट मीटिंग व प्रेझेंटेशन आठवण (Project Presentation Reminder)',
      customScript: 'नमस्कार राहुलजी! प्रेम यांच्या वतीने मी आपला स्मार्ट AI असिस्टंट बोलत आहे. आज दुपारी ४ वाजता आपली महत्त्वाची क्लायंट मिटिंग नियोजित आहे. आपण सर्व आवश्यक कागदपत्रे सोबत घेतली आहेत का? आपल्या दिवसासाठी खूप खूप शुभेच्छा!',
      fallbackOption: 'call_then_whatsapp',
      whatsappMessage: 'नमस्कार राहुलजी! 🚩 प्रेम यांच्या वतीने ही महत्त्वाची आठवण आहे: आज दुपारी ४:०० वाजता आपली मुख्य प्रोजेक्ट प्रेझेंटेशन मीटिंग आहे. कृपया वेळेवर उपस्थित राहावे. - प्रेम जाधव',
      smsMessage: 'AwaazAI Reminder: Rahul ji, Project presentation meeting scheduled today at 4:00 PM. Best wishes from Prem Jadhav.',
      retryOnNoAnswer: true,
      maxRetries: 3,
      retryIntervalMinutes: 5,
      status: 'scheduled',
      createdAt: now.toISOString(),
    },
    {
      id: 'rem_2',
      contactName: 'सुनीता शर्मा (Sunita Sharma)',
      phoneNumber: '+91 91234 56780',
      scheduledDateTime: tomorrowMorning,
      language: 'hi',
      voiceId: 'priya_hi',
      voiceTone: 'friendly',
      callGoal: 'दवाइयां और स्वास्थ्य का हालचाल (Health & Medicine Gentle Reminder)',
      customScript: 'नमस्ते सुनीता जी! आशा है आप बहुत अच्छे स्वास्थ्य में होंगी। यह आपके प्रियजन प्रेम की ओर से एक स्नेहपूर्ण रिमाइंडर है कि सुबह नाश्ते के बाद अपनी नियमित विटामिन्स और दवाई लेना न भूलें। आपका दिन बहुत ही मंगलमय और खुशहाल रहे!',
      fallbackOption: 'call_then_both',
      whatsappMessage: 'नमस्ते सुनीता जी! 🌸 प्रेम जी की ओर से यह एक स्नेहपूर्ण संदेश है: कृपया सुबह की अपनी नियमित दवाइयां समय पर ले लें और भरपूर पानी पिएं। आपका दिन शुभ हो!',
      smsMessage: 'AwaazAI: Namaste Sunita ji, Gentle reminder to take your morning medicine. Wishing you great health! - Prem Jadhav',
      retryOnNoAnswer: true,
      maxRetries: 2,
      retryIntervalMinutes: 10,
      status: 'scheduled',
      createdAt: now.toISOString(),
    },
    {
      id: 'rem_3',
      contactName: 'Amit Verma (Accounts)',
      phoneNumber: '+91 99887 76655',
      scheduledDateTime: pastOneHour,
      language: 'en',
      voiceId: 'vikram_en',
      voiceTone: 'professional',
      callGoal: 'Monthly Invoice Clearance Notification',
      customScript: 'Hello Amit sir, warm greetings from Prem Jadhav. This is a gentle reminder regarding the Q3 pending invoice clearance before the weekend banking cutoff. We truly value our collaboration and look forward to your confirmation.',
      fallbackOption: 'call_then_whatsapp',
      whatsappMessage: 'Dear Amit ji, Greetings from Prem Jadhav! We attempted to reach you via AI call regarding Q3 invoice verification. Kindly confirm once processed: https://awaaz.ai/inv/8849. Thank you!',
      smsMessage: 'AwaazAI: Tried calling you regarding Invoice Q3. Please check WhatsApp for invoice details. - Prem Jadhav',
      retryOnNoAnswer: true,
      maxRetries: 1,
      retryIntervalMinutes: 5,
      status: 'whatsapp_fallback_sent',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      lastAttemptAt: pastOneHour,
      callOutcomeNotes: 'Call was unanswered after 5 rings (28s). Automated WhatsApp fallback message was immediately dispatched successfully.',
      durationSeconds: 28,
    },
    {
      id: 'rem_4',
      contactName: 'विक्रम गायकवाड (Vikram Gaikwad)',
      phoneNumber: '+91 97654 32109',
      scheduledDateTime: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
      language: 'mr',
      voiceId: 'sneha_mr',
      voiceTone: 'professional',
      callGoal: 'अपॉइंटमेंट व वेळेची खात्री (Appointment Schedule Confirmation)',
      customScript: 'नमस्कार विक्रमजी! प्रेम जाधव यांच्या वतीने AI असिस्टंट स्नेहा बोलत आहे. आज संध्याकाळी आपली नियोजित भेट आहे, आपण वेळेवर पोहोचू शकाल का याची खात्री करण्यासाठी हा कॉल केला आहे.',
      fallbackOption: 'call_then_sms',
      whatsappMessage: 'नमस्कार विक्रमजी! आज संध्याकाळच्या भेटीबद्दलचा हा व्हॉट्सॲप मेसेज आहे.',
      smsMessage: 'AwaazAI: Namaste Vikram ji, AI call reminder for your evening appointment with Prem Jadhav. If any reschedule, please reply to this SMS.',
      retryOnNoAnswer: true,
      maxRetries: 2,
      retryIntervalMinutes: 5,
      status: 'scheduled',
      createdAt: now.toISOString(),
    },
  ];
}

export const INITIAL_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'tx_1092',
    userEmail: 'vikas.deshmukh@gmail.com',
    planId: 'pro',
    planName: 'Pro Multi-Lingual Caller & WhatsApp',
    amountINR: 499,
    vpaAddress: DEFAULT_OWNER_VPA,
    transactionRef: 'UPI/428901928491/PHONEPE',
    paymentMethod: 'phonepe',
    status: 'success',
    date: '2026-10-16 18:24',
    customerName: 'Vikas Deshmukh (Pune)',
  },
  {
    id: 'tx_1093',
    userEmail: 'anita.joshi@outlook.com',
    planId: 'business',
    planName: 'Business VIP Unlimited',
    amountINR: 999,
    vpaAddress: DEFAULT_OWNER_VPA,
    transactionRef: 'UPI/428919283921/GPAY',
    paymentMethod: 'gpay',
    status: 'success',
    date: '2026-10-17 02:15',
    customerName: 'Anita Joshi Enterprises (Mumbai)',
  },
  {
    id: 'tx_1094',
    userEmail: 'rohit.shinde@techmail.in',
    planId: 'starter',
    planName: 'Starter AI Caller',
    amountINR: 199,
    vpaAddress: DEFAULT_OWNER_VPA,
    transactionRef: 'UPI/428938492019/PAYTM',
    paymentMethod: 'paytm',
    status: 'success',
    date: '2026-10-17 05:40',
    customerName: 'Rohit Shinde (Nashik)',
  },
];

// Helper functions for reading & saving to LocalStorage with fallback
export function loadReminders(): ScheduledReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) {
      const initial = getInitialReminders();
      saveReminders(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialReminders();
  }
}

export function saveReminders(items: ScheduledReminder[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(items));
    updateSyncTimestamp();
  } catch (err) {
    console.error('Failed to save reminders', err);
  }
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      const initial = getInitialProfile();
      saveProfile(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return { ...getInitialProfile(), ...parsed };
  } catch {
    return getInitialProfile();
  }
}

export function saveProfile(profile: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    updateSyncTimestamp();
  } catch (err) {
    console.error('Failed to save profile', err);
  }
}

export function loadAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
    if (!raw) {
      saveAdminSettings(INITIAL_ADMIN_SETTINGS);
      return INITIAL_ADMIN_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...INITIAL_ADMIN_SETTINGS, ...parsed };
  } catch {
    return INITIAL_ADMIN_SETTINGS;
  }
}

export function saveAdminSettings(settings: AdminSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
    updateSyncTimestamp();
  } catch (err) {
    console.error('Failed to save admin settings', err);
  }
}

export function loadPayments(): PaymentTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) {
      savePayments(INITIAL_PAYMENTS);
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENTS;
  }
}

export function savePayments(payments: PaymentTransaction[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    updateSyncTimestamp();
  } catch (err) {
    console.error('Failed to save payments', err);
  }
}

export const INITIAL_EQUAL_AI_SETTINGS: EqualAiSettings = {
  aiFirstResponseEnabled: true,
  autoBlockFraud: true,
  silentCompanyTelemarketers: true,
  notifyLiveChat: true,
  sendSummaryToWhatsApp: true,
  greetingLanguage: 'hi',
  screeningSensitivity: 'strict',
};

export function getInitialScreenedCalls(): ScreenedCall[] {
  const now = new Date();
  return [
    {
      id: 'sc_1',
      callerName: 'Bajaj Credit Card Sales (Spam)',
      callerNumber: '+91 140 982 1102',
      callerType: 'fraud_scam',
      spamScore: 94,
      status: 'blocked',
      actionTaken: 'auto_blocked',
      recordingDurationSec: 14,
      language: 'hi',
      timestamp: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      hasAudioRecording: true,
      aiSummary: 'Unverified financial telemarketer offering unsolicited credit card. AI Assistant detected spam pattern (94% score) and terminated call cleanly.',
      screeningTranscript: [
        {
          id: 't1',
          speaker: 'ai_assistant',
          text: 'नमस्ते! मैं प्रेम जाधव जी का AI असिस्टेंट बोल रहा हूँ। आप कौन बोल रहे हैं और किस विषय में कॉल किया है?',
          time: '11:42:02',
        },
        {
          id: 't2',
          speaker: 'caller',
          text: 'सर हम बजाज फिनसर्व से बोल रहे हैं, आपका 15 लाख का लाइफटाइम फ्री क्रेडिट कार्ड अप्रूव हो गया है तुरंत...',
          time: '11:42:07',
        },
        {
          id: 't3',
          speaker: 'ai_assistant',
          text: 'यह नंबर DND सूची में है। वित्तीय टेलीमार्केटिंग कॉल्स स्वतः ब्लॉक की जाती हैं। कृपया इस नंबर पर दोबारा कॉल न करें। धन्यवाद।',
          time: '11:42:13',
        },
      ],
    },
    {
      id: 'sc_2',
      callerName: 'डॉ. विकास देशमुख (Dr. Vikas Deshmukh)',
      callerNumber: '+91 98220 12345',
      callerType: 'vip',
      spamScore: 4,
      status: 'completed',
      actionTaken: 'forwarded_whatsapp',
      recordingDurationSec: 32,
      language: 'mr',
      timestamp: new Date(now.getTime() - 95 * 60 * 1000).toISOString(),
      hasAudioRecording: true,
      aiSummary: 'Dr. Vikas Deshmukh called regarding tomorrow medical report review. AI took detailed message and immediately forwarded to Prem on WhatsApp.',
      screeningTranscript: [
        {
          id: 'm1',
          speaker: 'ai_assistant',
          text: 'नमस्कार! मी प्रेम जाधव यांचा AI असिस्टंट बोलत आहे. आपण कोण बोलत आहात आणि कशाबद्दल फोन केला आहे?',
          time: '10:30:05',
        },
        {
          id: 'm2',
          speaker: 'caller',
          text: 'नमस्कार, मी डॉ. विकास देशमुख बोलतोय. उद्याच्या मेडिकल रिपोर्ट आणि ब्लड टेस्टबद्दल चर्चा करायची होती.',
          time: '10:30:14',
        },
        {
          id: 'm3',
          speaker: 'ai_assistant',
          text: 'धन्यवाद डॉक्टर साहेब! प्रेमजी सध्या मिटिंगमध्ये व्यस्त आहेत. मी आपला हा संपूर्ण संदेश आणि कॉल रेकॉर्डिंग त्यांच्या व्हॉट्सॲपवर लगेच पाठवत आहे.',
          time: '10:30:24',
        },
      ],
    },
    {
      id: 'sc_3',
      callerName: 'BlueDart Express Delivery',
      callerNumber: '+91 91520 88990',
      callerType: 'delivery',
      spamScore: 8,
      status: 'completed',
      actionTaken: 'screened_normal',
      recordingDurationSec: 22,
      language: 'en',
      timestamp: new Date(now.getTime() - 210 * 60 * 1000).toISOString(),
      hasAudioRecording: true,
      aiSummary: 'Delivery executive for urgent parcel. AI instructed driver to leave package with building security desk.',
      screeningTranscript: [
        {
          id: 'e1',
          speaker: 'ai_assistant',
          text: 'Hello! I am Prem Jadhav\'s AI Assistant. How can I assist you?',
          time: '08:15:02',
        },
        {
          id: 'e2',
          speaker: 'caller',
          text: 'Sir I am at the society main gate with your documents parcel from BlueDart.',
          time: '08:15:10',
        },
        {
          id: 'e3',
          speaker: 'ai_assistant',
          text: 'Understood! Please deposit the parcel at Tower B Security Reception and register flat 402. Thank you!',
          time: '08:15:18',
        },
      ],
    },
  ];
}

export function loadScreenedCalls(): ScreenedCall[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCREENED_CALLS);
    if (!raw) {
      const initial = getInitialScreenedCalls();
      saveScreenedCalls(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialScreenedCalls();
  }
}

export function saveScreenedCalls(calls: ScreenedCall[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SCREENED_CALLS, JSON.stringify(calls));
    updateSyncTimestamp();
  } catch (err) {
    console.error('Failed to save screened calls', err);
  }
}

export function loadEqualAiSettings(): EqualAiSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EQUAL_AI_SETTINGS);
    if (!raw) {
      saveEqualAiSettings(INITIAL_EQUAL_AI_SETTINGS);
      return INITIAL_EQUAL_AI_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EQUAL_AI_SETTINGS;
  }
}

export function saveEqualAiSettings(settings: EqualAiSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.EQUAL_AI_SETTINGS, JSON.stringify(settings));
    updateSyncTimestamp();
  } catch (err) {
    console.error('Failed to save equal ai settings', err);
  }
}

function updateSyncTimestamp() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.lastSyncedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
}

