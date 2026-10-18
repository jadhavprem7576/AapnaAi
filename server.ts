import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ttsAudioCache = new Map<string, string>();

function getVoiceConfigForPersona(voiceId?: string, lang?: string, tone?: string) {
  switch (voiceId) {
    case 'jarvis_ai':
      return {
        voiceName: 'Charon',
        style:
          'Calm, composed, ultra-intelligent British cybernetic butler like Iron Man J.A.R.V.I.S., crisp articulation, polite, tactical, and sophisticated',
      };
    case 'friday_ai':
      return {
        voiceName: 'Zephyr',
        style:
          'Crisp, intelligent, warm tactical female AI assistant like Iron Man F.R.I.D.A.Y., confident, clear, and responsive',
      };
    case 'aarav_hi':
    case 'vikram_en':
    case 'arjun_mr':
    case 'bhavin_gu':
      return {
        voiceName: 'Charon',
        style:
          'Warm, articulate, authoritative and respectful Indian executive voice, natural conversational cadence',
      };
    case 'kabir_hi':
      return {
        voiceName: 'Fenrir',
        style: 'Deep, calm, reassuring and dignified Indian male voice, smooth pacing',
      };
    case 'rohan_mr':
    case 'raj_en':
    case 'rajesh_te':
      return {
        voiceName: 'Puck',
        style: 'Friendly, polite, approachable and energetic Indian male conversational assistant',
      };
    case 'neha_hi':
    case 'aditi_en':
      return {
        voiceName: 'Zephyr',
        style: 'Bright, cheerful, articulate and modern Indian female AI assistant',
      };
    case 'priya_hi':
    case 'meera_mr':
    case 'sneha_mr':
    case 'ananya_en':
    default:
      return {
        voiceName: tone === 'professional' ? 'Zephyr' : 'Kore',
        style:
          lang === 'mr'
            ? 'Warm, natural, caring and polite Marathi speaking female assistant'
            : lang === 'hi'
            ? 'Warm, natural, empathetic and polite Hindi speaking female assistant'
            : 'Clear, warm, natural Indian English assistant with studio-grade clarity',
      };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  app.post('/api/tts', async (req, res) => {
    try {
      const { text, lang = 'hi', voiceId = 'jarvis_ai', tone = 'professional' } = req.body || {};
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text is required for speech generation.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(503).json({ error: 'GEMINI_API_KEY not configured on server.' });
        return;
      }

      const cacheKey = `${voiceId}:${lang}:${tone}:${text.trim().slice(0, 240)}`;
      const cached = ttsAudioCache.get(cacheKey);
      if (cached) {
        res.json({ audioBase64: cached, mimeType: 'audio/wav', cached: true });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const { voiceName, style } = getVoiceConfigForPersona(voiceId, lang, tone);

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  style,
                },
              } as Record<string, unknown>,
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        res.status(502).json({ error: 'No audio data returned from Gemini TTS.' });
        return;
      }

      if (ttsAudioCache.size > 60) {
        const firstKey = ttsAudioCache.keys().next().value;
        if (firstKey) ttsAudioCache.delete(firstKey);
      }
      ttsAudioCache.set(cacheKey, base64Audio);

      res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'TTS generation failed';
      res.status(500).json({ error: message });
    }
  });

  const cleanupServiceWorkerScript = `
self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (e) {}
      try {
        await self.registration.unregister();
      } catch (e) {}
    })()
  );
});
`;

  // Serve Web App Manifest
  app.get(['/manifest.json', '/manifest.webmanifest'], (_req, res) => {
    const manifestPath = path.join(__dirname, 'public', 'manifest.json');
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(manifestPath);
  });

  // Serve Direct Android APK Download
  app.get(['/AwaazAI-Android-v2.4.apk', '/download/apk', '/apk'], (_req, res) => {
    const apkPath = path.join(__dirname, 'public', 'AwaazAI-Android-v2.4.apk');
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="AwaazAI-Android-v2.4.apk"');
    res.sendFile(apkPath);
  });

  // Serve Service Worker for Android PWA WebAPK
  app.get('/sw.js', (req, res) => {
    if (req.query.cleanup === '1') {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.status(200).send(cleanupServiceWorkerScript);
      return;
    }
    const swPath = path.join(__dirname, 'public', 'sw.js');
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, public, max-age=0');
    res.sendFile(swPath);
  });

  app.get(['/dev-sw.js', '/registerSW.js'], (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(200).send(cleanupServiceWorkerScript);
  });

  // Dedicated Mobile App 1-Tap Installer & Direct Download Page
  app.get(['/install', '/download', '/app-install'], (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#020617">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" type="image/svg+xml" href="/icon.svg">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <title>AwaazAI Android App Installer (डायरेक्ट डाउनलोड)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #020617;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 28px;
      width: 100%;
      max-width: 440px;
      padding: 28px 24px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(14, 165, 233, 0.15);
    }
    .logo-wrap {
      width: 72px;
      height: 72px;
      margin: 0 auto 16px;
      background: linear-gradient(135deg, #4f46e5, #06b6d4);
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
    .logo-wrap svg {
      width: 38px;
      height: 38px;
      fill: none;
      stroke: #ffffff;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 999px;
      color: #34d399;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .desc {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .btn-install {
      width: 100%;
      min-height: 54px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      border: none;
      border-radius: 18px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
      transition: transform 0.15s, opacity 0.15s;
      margin-bottom: 12px;
      text-decoration: none;
    }
    .btn-install:active {
      transform: scale(0.98);
    }
    .btn-apk {
      width: 100%;
      min-height: 48px;
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      margin-bottom: 12px;
      transition: background 0.15s;
    }
    .btn-open {
      width: 100%;
      min-height: 44px;
      background: transparent;
      border: 1px solid rgba(148, 163, 184, 0.2);
      color: #cbd5e1;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-decoration: none;
      margin-bottom: 20px;
    }
    .steps {
      background: rgba(2, 6, 23, 0.7);
      border: 1px solid rgba(30, 41, 59, 0.8);
      border-radius: 18px;
      padding: 16px;
      text-align: left;
      margin-top: 10px;
    }
    .steps-title {
      font-size: 12px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.4;
    }
    .step-num {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: rgba(56, 189, 248, 0.2);
      color: #38bdf8;
      font-size: 10px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .step-item:last-child { margin-bottom: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-wrap">
      <svg viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
    </div>
    <h1>AwaazAI · Android App</h1>
    <div class="badge">
      <span>●</span> Official Android App (Direct Install)
    </div>
    <p class="desc">
      Aapka apna Multilingual AI Voice Caller, J.A.R.V.I.S. Call Assistant aur Screen Protector direct phone me install karein.
    </p>

    <!-- 1-Tap PWA / WebAPK Install Button -->
    <button id="installBtn" class="btn-install">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      <span>📱 Install App on Android (1-Tap)</span>
    </button>

    <!-- Direct APK Download Button -->
    <a href="/AwaazAI-Android-v2.4.apk" download="AwaazAI-Android-v2.4.apk" class="btn-apk">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      <span>📦 Download APK File (Direct .apk)</span>
    </a>

    <!-- Open in Browser -->
    <a href="/" class="btn-open">
      <span>🌐 Open App in Browser Directly</span>
    </a>

    <!-- Visual 3-step Instructions -->
    <div class="steps">
      <div class="steps-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <span>Android Phone me Kaise Install Karein?</span>
      </div>
      <div class="step-item">
        <div class="step-num">1</div>
        <div>Upar <strong>"Install App on Android"</strong> green button dabayein.</div>
      </div>
      <div class="step-item">
        <div class="step-num">2</div>
        <div>Agar prompt na aaye, to Chrome browser ke upar <strong>3 dots (⋮)</strong> par click karein.</div>
      </div>
      <div class="step-item">
        <div class="step-num">3</div>
        <div><strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> par tap karein — app aapke phone ke app drawer me WhatsApp ki tarah install ho jayega!</div>
      </div>
    </div>
  </div>

  <script>
    let deferredPrompt = null;
    const installBtn = document.getElementById('installBtn');

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(function(){});
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.style.background = 'linear-gradient(135deg, #10b981, #047857)';
    });

    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          installBtn.innerHTML = '<span>✅ App Installed Successfully!</span>';
        }
        deferredPrompt = null;
      } else {
        alert("Chrome me upar 3 dots (⋮) par tap karein aur 'Install app' ya 'Add to Home screen' chunein!");
      }
    });

    window.addEventListener('appinstalled', () => {
      installBtn.innerHTML = '<span>✅ App Installed on Phone!</span>';
    });
  </script>
</body>
</html>`);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AwaazAI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
