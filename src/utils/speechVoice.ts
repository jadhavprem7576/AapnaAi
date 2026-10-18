import { LanguageCode, VoiceTone, AiVoiceProfile } from '../types';

class SoundEffects {
  private audioCtx: AudioContext | null = null;
  private ringInterval: number | null = null;

  public getAudioContext(): AudioContext | null {
    if (!this.audioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playRing() {
    this.stopRing();
    const playBeep = () => {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(480, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    };

    playBeep();
    this.ringInterval = window.setInterval(playBeep, 2800);
  }

  stopRing() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  playSuccess() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.09, ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.32);
    });
  }

  playJarvisHud() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    // Stark HUD Arc-Reactor futuristic telemetry chime
    const freqs = [880, 1318.5, 1760, 2637];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.045);
      gain.gain.setValueAtTime(0.07, ctx.currentTime + i * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + i * 0.045 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.045);
      osc.stop(ctx.currentTime + i * 0.045 + 0.24);
    });
  }

  playClick() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(840, ctx.currentTime);
    gain.gain.setValueAtTime(0.045, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.045);
  }
}

export const soundEffects = new SoundEffects();

export const AI_VOICE_PROFILES: AiVoiceProfile[] = [
  // --- STARK AI / IRON MAN SPECIAL EDITION VOICES (Universal across EN / HI / MR) ---
  {
    id: 'jarvis_ai',
    name: 'J.A.R.V.I.S. (Iron Man AI)',
    nameNative: 'J.A.R.V.I.S. · Stark Cybernetic Butler HD',
    gender: 'male',
    language: 'en',
    tone: 'professional',
    personaTitle: 'Iron Man Stark Tactical Butler · Neural HD',
    accent: 'British / Stark Cybernetic HD',
    pitch: 0.94,
    rate: 1.0,
    isUniversal: true,
    isStarkAi: true,
    geminiVoice: 'Charon',
    sampleGreeting:
      'Good day, Sir. J.A.R.V.I.S. online. All Equal AI call defense protocols and voice reminders are active and standing by for Prem Jadhav.',
    sampleGreetingHi:
      'नमस्कार सर! मैं जार्विस बोल रहा हूँ। आपके सभी कॉल डिफेंस प्रोटोकॉल और स्मार्ट रिमाइंडर सिस्टम पूरी तरह से ऑनलाइन हैं।',
    sampleGreetingMr:
      'नमस्कार सर! मी जार्विस बोलत आहे. आपली संपूर्ण कॉल सुरक्षा प्रणाली आणि स्मार्ट रिमाइंडर सिस्टिम आता ऑनलाईन आहे.',
  },
  {
    id: 'friday_ai',
    name: 'F.R.I.D.A.Y. (Stark Tactical AI)',
    nameNative: 'F.R.I.D.A.Y. · Stark Combat & Call Assistant HD',
    gender: 'female',
    language: 'en',
    tone: 'energetic',
    personaTitle: 'Stark Tactical Female AI · Neural HD',
    accent: 'Crisp Tactical HD',
    pitch: 1.04,
    rate: 1.02,
    isUniversal: true,
    isStarkAi: true,
    geminiVoice: 'Zephyr',
    sampleGreeting:
      'Systems online, Boss! F.R.I.D.A.Y. here. I am monitoring your incoming calls and ready to intercept spam in real time.',
    sampleGreetingHi:
      'सिस्टम ऑनलाइन है बॉस! मैं फ्राइडे बोल रही हूँ। आपके सभी इनकमिंग कॉल्स की लाइव स्क्रीनिंग चालू है।',
    sampleGreetingMr:
      'सिस्टिम ऑनलाईन आहे बॉस! मी फ्रायडे बोलत आहे. तुमच्या सर्व इनकमिंग कॉल्सची लाईव्ह स्क्रीनिंग सुरू आहे.',
  },

  // --- HINDI STUDIO HD VOICES ---
  {
    id: 'priya_hi',
    name: 'Priya HD (प्रिया)',
    nameNative: 'प्रिया Neural HD (हिंदी - मधुर व स्पष्ट)',
    gender: 'female',
    language: 'hi',
    tone: 'empathetic',
    personaTitle: 'Studio HD Warm & Empathetic Hindi Voice',
    accent: 'Natural Hindi HD',
    pitch: 1.04,
    rate: 0.98,
    geminiVoice: 'Kore',
    sampleGreeting:
      'नमस्ते! मैं प्रिया बोल रही हूँ। आपकी सभी महत्वपूर्ण कॉल्स और रिमाइंडर के लिए मैं हमेशा तैयार हूँ।',
  },
  {
    id: 'aarav_hi',
    name: 'Aarav HD (आरव)',
    nameNative: 'आरव Neural HD (हिंदी - प्रोफेशनल)',
    gender: 'male',
    language: 'hi',
    tone: 'professional',
    personaTitle: 'Studio HD Executive Hindi Voice',
    accent: 'Natural Hindi HD',
    pitch: 0.96,
    rate: 0.98,
    geminiVoice: 'Charon',
    sampleGreeting:
      'नमस्ते! मैं आरव बात कर रहा हूँ। आपका दिन बहुत ही सफल और मंगलमय रहे।',
  },
  {
    id: 'neha_hi',
    name: 'Neha HD (नेहा)',
    nameNative: 'नेहा Neural HD (हिंदी - उत्साही)',
    gender: 'female',
    language: 'hi',
    tone: 'energetic',
    personaTitle: 'Bright & Expressive Hindi Assistant',
    accent: 'Natural Hindi HD',
    pitch: 1.06,
    rate: 1.01,
    geminiVoice: 'Zephyr',
    sampleGreeting:
      'नमस्ते जी! मैं नेहा हूँ! आज का दिन आपके लिए नई ऊर्जा और खुशियाँ लेकर आए!',
  },
  {
    id: 'kabir_hi',
    name: 'Kabir HD (कबीर)',
    nameNative: 'कबीर Neural HD (हिंदी - गंभीर व आदरयुक्त)',
    gender: 'male',
    language: 'hi',
    tone: 'respectful',
    personaTitle: 'Deep, Calm & Reassuring Studio Voice',
    accent: 'Natural Hindi HD',
    pitch: 0.92,
    rate: 0.95,
    geminiVoice: 'Fenrir',
    sampleGreeting:
      'नमस्ते। मैं कबीर बात कर रहा हूँ। आपके जरूरी कार्य की सूचना देने के लिए यह कॉल किया गया है।',
  },

  // --- MARATHI STUDIO HD VOICES ---
  {
    id: 'meera_mr',
    name: 'Meera HD (मीरा)',
    nameNative: 'मीरा Neural HD (मराठी - प्रेमळ व नैसर्गिक)',
    gender: 'female',
    language: 'mr',
    tone: 'empathetic',
    personaTitle: 'Studio HD Caring Marathi Voice',
    accent: 'Natural Marathi HD',
    pitch: 1.03,
    rate: 0.97,
    geminiVoice: 'Kore',
    sampleGreeting:
      'नमस्कार! मी मीरा बोलत आहे. आपले आरोग्य उत्तम राहो आणि आजचा दिवस आनंदी जावो!',
  },
  {
    id: 'rohan_mr',
    name: 'Rohan HD (रोहन)',
    nameNative: 'रोहन Neural HD (मराठी - स्पष्ट व नम्र)',
    gender: 'male',
    language: 'mr',
    tone: 'friendly',
    personaTitle: 'Studio HD Polite Marathi Voice',
    accent: 'Natural Marathi HD',
    pitch: 0.97,
    rate: 0.99,
    geminiVoice: 'Puck',
    sampleGreeting:
      'नमस्कार! मी रोहन. आपल्या नियोजित कामांसाठी आणि महत्त्वाच्या निरोपासाठी सज्ज आहे.',
  },
  {
    id: 'sneha_mr',
    name: 'Sneha HD (स्नेहा)',
    nameNative: 'स्नेहा Neural HD (मराठी - व्यावसायिक)',
    gender: 'female',
    language: 'mr',
    tone: 'professional',
    personaTitle: 'Clear & Modern Corporate Marathi',
    accent: 'Natural Marathi HD',
    pitch: 1.05,
    rate: 0.98,
    geminiVoice: 'Zephyr',
    sampleGreeting:
      'नमस्कार! मी स्नेहा. आपल्या महत्त्वपूर्ण मीटिंगच्या पूर्वकल्पनेसाठी कॉल केला आहे.',
  },
  {
    id: 'arjun_mr',
    name: 'Arjun HD (अर्जुन)',
    nameNative: 'अर्जुन Neural HD (मराठी - धीरगंभीर)',
    gender: 'male',
    language: 'mr',
    tone: 'respectful',
    personaTitle: 'Dignified & Reassuring Marathi Tone',
    accent: 'Natural Marathi HD',
    pitch: 0.93,
    rate: 0.96,
    geminiVoice: 'Charon',
    sampleGreeting:
      'नमस्कार! मी अर्जुन बोलत आहे. आपल्या सर्व कामांचे वेळेवर स्मरण करून देण्यासाठी मी तत्पर आहे.',
  },

  // --- ENGLISH STUDIO HD VOICES ---
  {
    id: 'ananya_en',
    name: 'Ananya HD (अनन्या)',
    nameNative: 'Ananya Neural HD (English India - Warm)',
    gender: 'female',
    language: 'en',
    tone: 'friendly',
    personaTitle: 'Warm & Natural Corporate Assistant',
    accent: 'Indian English HD',
    pitch: 1.03,
    rate: 0.98,
    geminiVoice: 'Kore',
    sampleGreeting:
      'Hello! This is Ananya. Delivering your important call screenings and reminders with studio clarity.',
  },
  {
    id: 'vikram_en',
    name: 'Vikram HD (विक्रम)',
    nameNative: 'Vikram Neural HD (Executive Voice)',
    gender: 'male',
    language: 'en',
    tone: 'professional',
    personaTitle: 'Formal & Authoritative Executive Tone',
    accent: 'Indian English HD',
    pitch: 0.95,
    rate: 0.97,
    geminiVoice: 'Charon',
    sampleGreeting:
      'Good day! I am Vikram, placing this priority notification on your behalf.',
  },
  {
    id: 'aditi_en',
    name: 'Aditi HD (अदिती)',
    nameNative: 'Aditi Neural HD (Modern AI Receptionist)',
    gender: 'female',
    language: 'en',
    tone: 'energetic',
    personaTitle: 'Crisp, Articulate & Smart Voice',
    accent: 'Indian English HD',
    pitch: 1.05,
    rate: 1.0,
    geminiVoice: 'Zephyr',
    sampleGreeting:
      'Hi there! I am Aditi. Your automated call assistant is active and ready.',
  },
  {
    id: 'raj_en',
    name: 'Raj HD (राज)',
    nameNative: 'Raj Neural HD (Conversational)',
    gender: 'male',
    language: 'en',
    tone: 'friendly',
    personaTitle: 'Approachable & Warm Assistant',
    accent: 'Indian English HD',
    pitch: 0.98,
    rate: 0.99,
    geminiVoice: 'Puck',
    sampleGreeting:
      'Hello! Raj here. Just checking in with a quick friendly reminder as requested.',
  },

  // --- REGIONAL INDIAN VOICES ---
  {
    id: 'diya_gu',
    name: 'Diya HD (દીયા)',
    nameNative: 'દીયા Neural HD (ગુજરાતી)',
    gender: 'female',
    language: 'gu',
    tone: 'friendly',
    personaTitle: 'Sweet & Cheerful Gujarati Voice',
    accent: 'Gujarati HD',
    pitch: 1.04,
    rate: 0.97,
    geminiVoice: 'Kore',
    sampleGreeting:
      'નમસ્તે! હું દીયા છું. તમારો દિવસ ખૂબ જ સુંદર અને લાભદાયી રહે એવી શુભેચ્છા!',
  },
  {
    id: 'bhavin_gu',
    name: 'Bhavin HD (ભાવિન)',
    nameNative: 'ભાવિન Neural HD (ગુજરાતી)',
    gender: 'male',
    language: 'gu',
    tone: 'professional',
    personaTitle: 'Business Gujarati Voice',
    accent: 'Gujarati HD',
    pitch: 0.96,
    rate: 0.98,
    geminiVoice: 'Charon',
    sampleGreeting:
      'નમસ્તે! હું ભાવિન વાત કરું છું. તમારા મહત્વપૂર્ણ સંદેશા માટે મેં આ કોલ કર્યો છે.',
  },
  {
    id: 'kavya_ta',
    name: 'Kavya HD (காவ்யா)',
    nameNative: 'காவ்யா Neural HD (தமிழ்)',
    gender: 'female',
    language: 'ta',
    tone: 'respectful',
    personaTitle: 'Polite & Cultural Tamil Voice',
    accent: 'Tamil HD',
    pitch: 1.04,
    rate: 0.96,
    geminiVoice: 'Kore',
    sampleGreeting:
      'வணக்கம்! நான் காவ்யா பேசுகிறேன். உங்கள் நாள் சிறக்க நல்வாழ்த்துகள்.',
  },
  {
    id: 'rajesh_te',
    name: 'Rajesh HD (రాజేష్)',
    nameNative: 'రాజేష్ Neural HD (తెలుగు)',
    gender: 'male',
    language: 'te',
    tone: 'friendly',
    personaTitle: 'Warm & Professional Telugu Voice',
    accent: 'Telugu HD',
    pitch: 0.96,
    rate: 0.97,
    geminiVoice: 'Puck',
    sampleGreeting:
      'నమస్కారం! నేను రాజేష్ మాట్లాడుతున్నాను. మీ ముఖ్యమైన సమాచారం అందించడానికి కాల్ చేశాను.',
  },
];

export function getVoicesForLanguage(lang: LanguageCode): AiVoiceProfile[] {
  const universalStarkVoices = AI_VOICE_PROFILES.filter((v) => v.isUniversal);
  const langVoices = AI_VOICE_PROFILES.filter((v) => !v.isUniversal && v.language === lang);
  if (langVoices.length > 0) {
    return [...universalStarkVoices, ...langVoices];
  }
  return AI_VOICE_PROFILES;
}

export function getSampleGreetingForVoice(voice: AiVoiceProfile, lang: LanguageCode): string {
  if (lang === 'hi' && voice.sampleGreetingHi) return voice.sampleGreetingHi;
  if (lang === 'mr' && voice.sampleGreetingMr) return voice.sampleGreetingMr;
  return voice.sampleGreeting;
}

// Client-side cache for Gemini Neural HD WAV data URLs
const clientAudioCache = new Map<string, string>();
let activeAudioElement: HTMLAudioElement | null = null;
let activeSpeechSessionId = 0;

// Preload browser speechSynthesis voices immediately
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

function selectBestBrowserVoice(
  voices: SpeechSynthesisVoice[],
  lang: LanguageCode,
  profile?: AiVoiceProfile | null
): SpeechSynthesisVoice | undefined {
  if (!voices || voices.length === 0) return undefined;

  // Special preference for J.A.R.V.I.S. in English: crisp British or Natural Male voice
  if (profile?.id === 'jarvis_ai' && lang === 'en') {
    const jarvisMatch = voices.find(
      (v) =>
        v.name.includes('Google UK English Male') ||
        v.name.includes('Daniel') ||
        v.name.includes('Arthur') ||
        v.name.includes('Ryan') ||
        v.name.includes('George') ||
        (v.lang === 'en-GB' && (v.name.includes('Male') || v.name.includes('Natural')))
    );
    if (jarvisMatch) return jarvisMatch;
  }

  // Score voices to pick the most natural/neural voice for the target language and gender
  const targetPrefix = lang === 'mr' ? ['mr', 'hi'] : [lang];
  const scored = voices
    .filter((v) => targetPrefix.some((p) => v.lang.toLowerCase().startsWith(p)))
    .map((v) => {
      let score = 0;
      const name = v.name.toLowerCase();
      if (v.lang.toLowerCase().startsWith(lang)) score += 20;
      if (name.includes('natural') || name.includes('online') || name.includes('neural')) score += 35;
      if (name.includes('google')) score += 25;
      if (name.includes('india') || v.lang.toLowerCase().endsWith('-in')) score += 10;

      if (profile?.gender === 'male') {
        if (
          name.includes('male') ||
          name.includes('madhur') ||
          name.includes('manohar') ||
          name.includes('prabhat') ||
          name.includes('hemant') ||
          name.includes('ravi') ||
          name.includes('daniel')
        ) {
          score += 30;
        }
      } else if (profile?.gender === 'female') {
        if (
          name.includes('female') ||
          name.includes('swara') ||
          name.includes('aarohi') ||
          name.includes('neerja') ||
          name.includes('kalpana') ||
          name.includes('heera') ||
          name.includes('priya')
        ) {
          score += 30;
        }
      }
      return { voice: v, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.voice || voices.find((v) => v.lang.startsWith('en'));
}

function speakWithEnhancedBrowserTTS(
  text: string,
  lang: LanguageCode,
  tone: VoiceTone,
  onEnd?: () => void,
  voiceId?: string
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return null;
  }

  window.speechSynthesis.cancel();

  const profile = voiceId ? AI_VOICE_PROFILES.find((v) => v.id === voiceId) : null;
  const utterance = new SpeechSynthesisUtterance(text);

  if (profile?.id === 'jarvis_ai' && lang === 'en') {
    utterance.lang = 'en-GB';
  } else {
    const langMap: Record<LanguageCode, string> = {
      hi: 'hi-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      pa: 'pa-IN',
      en: 'en-IN',
    };
    utterance.lang = langMap[lang] || 'en-IN';
  }

  if (profile) {
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;
  } else {
    utterance.pitch = tone === 'respectful' ? 0.96 : 1.02;
    utterance.rate = 0.98;
  }

  const voices = window.speechSynthesis.getVoices();
  const bestVoice = selectBestBrowserVoice(voices, lang, profile);
  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/**
 * Play WAV base64 audio with optional Stark J.A.R.V.I.S. cybernetic resonator DSP
 */
function playWavBase64(
  base64Audio: string,
  isJarvisEffect: boolean,
  sessionId: number,
  onEnd?: () => void
) {
  if (sessionId !== activeSpeechSessionId) return;

  const dataUrl = `data:audio/wav;base64,${base64Audio}`;
  const audio = new Audio(dataUrl);
  activeAudioElement = audio;

  // Apply subtle Stark Cybernetic Helmet acoustic clarity when J.A.R.V.I.S. speaks
  if (isJarvisEffect) {
    try {
      const ctx = soundEffects.getAudioContext();
      if (ctx) {
        const source = ctx.createMediaElementSource(audio);
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 115;

        const presence = ctx.createBiquadFilter();
        presence.type = 'peaking';
        presence.frequency.value = 2100;
        presence.Q.value = 1.4;
        presence.gain.value = 3.5;

        source.connect(highpass);
        highpass.connect(presence);
        presence.connect(ctx.destination);
      }
    } catch {
      // Fallback to direct audio element output if MediaElementSource fails
    }
  }

  audio.onended = () => {
    if (activeAudioElement === audio) {
      activeAudioElement = null;
    }
    onEnd?.();
  };

  audio.onerror = () => {
    if (activeAudioElement === audio) {
      activeAudioElement = null;
    }
    onEnd?.();
  };

  audio.play().catch(() => {
    onEnd?.();
  });
}

/**
 * Hybrid Neural HD Speech Engine:
 * 1. Uses Gemini 3.8 Neural HD TTS (/api/tts) for realistic human & J.A.R.V.I.S. voices
 * 2. Automatically falls back to tuned Natural Browser TTS if offline
 */
export function speakText(
  text: string,
  lang: LanguageCode = 'hi',
  tone: VoiceTone = 'empathetic',
  onEnd?: () => void,
  voiceId?: string
): SpeechSynthesisUtterance | null {
  stopSpeaking();

  const sessionId = ++activeSpeechSessionId;
  const effectiveVoiceId = voiceId || 'jarvis_ai';
  const isStarkVoice = effectiveVoiceId === 'jarvis_ai' || effectiveVoiceId === 'friday_ai';

  if (isStarkVoice) {
    soundEffects.playJarvisHud();
  }

  const cacheKey = `${effectiveVoiceId}:${lang}:${tone}:${text.trim().slice(0, 240)}`;
  const cachedAudio = clientAudioCache.get(cacheKey);

  if (cachedAudio) {
    playWavBase64(cachedAudio, effectiveVoiceId === 'jarvis_ai', sessionId, onEnd);
    return null;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 4200);

  fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      lang,
      tone,
      voiceId: effectiveVoiceId,
    }),
    signal: controller.signal,
  })
    .then(async (res) => {
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('TTS API fallback');
      const data = await res.json();
      if (data?.audioBase64 && sessionId === activeSpeechSessionId) {
        clientAudioCache.set(cacheKey, data.audioBase64);
        playWavBase64(data.audioBase64, effectiveVoiceId === 'jarvis_ai', sessionId, onEnd);
      } else if (sessionId === activeSpeechSessionId) {
        speakWithEnhancedBrowserTTS(text, lang, tone, onEnd, effectiveVoiceId);
      }
    })
    .catch(() => {
      clearTimeout(timeoutId);
      if (sessionId === activeSpeechSessionId) {
        speakWithEnhancedBrowserTTS(text, lang, tone, onEnd, effectiveVoiceId);
      }
    });

  return null;
}

export function stopSpeaking() {
  activeSpeechSessionId++;
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      // Ignore pause errors
    }
    activeAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
