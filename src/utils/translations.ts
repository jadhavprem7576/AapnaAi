import { LanguageCode } from '../types';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी (India)', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी (महाराष्ट्र)', flag: '🚩' },
  { code: 'en', label: 'English', nativeName: 'English (India)', flag: '🌐' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

export const UI_TRANSLATIONS: Record<string, { hi: string; mr: string; en: string }> = {
  appName: {
    hi: 'आवाज़ AI कॉल व मेसेज असिस्टेंट',
    mr: 'आवाज AI कॉल व मेसेज असिस्टंट',
    en: 'Awaaz AI Call & Message Assistant',
  },
  tagline: {
    hi: 'सकारात्मक AI कॉल, स्मार्ट रिमाइंडर और तुरंत व्हाट्सएप फॉलबॅक',
    mr: 'सकारात्मक AI कॉल, स्मार्ट स्मरणपत्र आणि त्वरित व्हॉट्सॲप फॉलबॅक',
    en: 'Thoughtful Positive AI Voice Caller & Smart Auto-Fallback Reminders',
  },
  trialBadge: {
    hi: '2 दिन का फ्री ट्रायल एक्टिव',
    mr: '२ दिवसांची मोफत चाचणी सुरू',
    en: '2-Day Free Trial Active',
  },
  trialEndsIn: {
    hi: 'ट्रायल समाप्त होने में शेष:',
    mr: 'चाचणी समाप्त होण्यास उर्वरित:',
    en: 'Trial ends in:',
  },
  upgradeNow: {
    hi: 'UPI से अपग्रेड करें',
    mr: 'UPI द्वारे अपग्रेड करा',
    en: 'Upgrade via UPI',
  },
  dashboard: {
    hi: 'डैशबोर्ड',
    mr: 'डॅशबोर्ड',
    en: 'Dashboard',
  },
  scheduleNew: {
    hi: 'कॉल व मेसेज शेड्यूल करें',
    mr: 'कॉल व मेसेज शेड्यूल करा',
    en: 'Schedule Call & Message',
  },
  allQueue: {
    hi: 'कॉल शेड्यूल्स व इतिहास',
    mr: 'कॉल शेड्यूल्स व इतिहास',
    en: 'Call Schedule & History',
  },
  subscription: {
    hi: 'सब्सक्रिप्शन व UPI भुगतान',
    mr: 'सबस्क्रिप्शन व UPI पेमेंट',
    en: 'Subscription & UPI Pay',
  },
  securitySync: {
    hi: 'सुरक्षा व सिंक',
    mr: 'सुरक्षा व सिंक',
    en: 'Security & Sync',
  },
  profile: {
    hi: 'प्रोफाइल व सेटिंग्स',
    mr: 'प्रोफाइल व सेटिंग्ज',
    en: 'Profile & Settings',
  },
  adminPanel: {
    hi: 'मालिक/एडमिन कंट्रोल',
    mr: 'मालक/ॲडमिन कंट्रोल',
    en: 'Owner Admin Panel',
  },
  howToUse: {
    hi: 'ऐप कैसे काम करता है? (AI गाइड)',
    mr: 'ॲप कसे वापरावे? (AI मार्गदर्शक)',
    en: 'How It Works (AI Guide)',
  },
  upcomingCalls: {
    hi: 'आगामी शेड्यूल्ड कॉल्स',
    mr: 'आगामी नियोजित कॉल्स',
    en: 'Upcoming Scheduled Calls',
  },
  completedCalls: {
    hi: 'सफल कॉल्स',
    mr: 'यशस्वी कॉल्स',
    en: 'Completed Calls',
  },
  fallbackSent: {
    hi: 'फॉलबॅक SMS / WhatsApp',
    mr: 'फॉलबॅक SMS / व्हॉट्सॲप',
    en: 'Fallbacks Dispatched',
  },
  syncStatus: {
    hi: 'ऑटो-सिंकिंग चालू (AES-256 सुरक्षित)',
    mr: 'ऑटो-सिंक सुरू (AES-256 सुरक्षित)',
    en: 'Auto-Sync Active (AES-256 Secure)',
  },
};
