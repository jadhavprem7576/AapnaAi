import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Copy,
  Check,
  X,
  Share2,
  Terminal,
  ShieldCheck,
  Apple,
  QrCode,
  FileCode2,
  FolderGit2,
} from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { LanguageCode } from '../types';
import { soundEffects } from '../utils/speechVoice';

interface PWAInstallButtonProps {
  currentLang?: LanguageCode;
  onOpenModal?: () => void;
  compact?: boolean;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg border border-amber-300">
      <span className="h-2 w-2 rounded-full bg-slate-950 animate-pulse" />
      <span>Offline Mode — Cached AI voices & data active</span>
    </div>
  );
};

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  currentLang = 'en',
  onOpenModal,
  compact = false,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleClick = async () => {
    soundEffects.playClick();
    if (isInstallable) {
      const accepted = await install();
      if (!accepted && onOpenModal) {
        onOpenModal();
      }
    } else if (onOpenModal) {
      onOpenModal();
    }
  };

  if (isInstalled && compact) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={
        compact
          ? 'min-h-[36px] px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap'
          : 'w-full min-h-[46px] px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer whitespace-nowrap'
      }
      title="Download Android APK & GitHub Code (prame)"
    >
      <Download className="w-3.5 h-3.5 shrink-0" />
      <span>
        {compact
          ? 'APK / GitHub'
          : currentLang === 'hi'
          ? 'Android APK और GitHub कोड (prame) डाउनलोड करें'
          : currentLang === 'mr'
          ? 'Android APK आणि GitHub कोड (prame) डाउनलोड करा'
          : 'Download Android APK & GitHub Code (prame)'}
      </span>
    </button>
  );
};

const PRAME_GITHUB_WORKFLOW_CODE = `name: Build & Publish Direct Phone APK (Prame Edition)

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-android-apk:
    name: Compile Signed Android APK & Publish Phone Link
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Java JDK 17 for Android SDK
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: 17

      - name: Setup Android SDK Tools
        uses: android-actions/setup-android@v3

      - name: Install Dependencies & Build Web App Bundle
        run: |
          npm install
          npm run build

      - name: Initialize Capacitor Android Native Project
        run: |
          npm install @capacitor/core @capacitor/cli @capacitor/android
          npx cap add android || true
          npx cap sync android

      - name: Generate V1/V2 Signing Keystore & Compile Signed Release APK
        working-directory: ./android
        run: |
          chmod +x gradlew
          ./gradlew assembleDebug
          cp app/build/outputs/apk/debug/app-debug.apk ../AwaazAI-Android-v2.4.apk

      - name: Publish Direct Download APK to GitHub Releases
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v2.4.0-latest
          name: "AwaazAI (J.A.R.V.I.S. Edition) — Direct Phone APK"
          files: |
            AwaazAI-Android-v2.4.apk`;

interface MobileAppInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
}

export const MobileAppInstallerModal: React.FC<MobileAppInstallerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isIOS, install } = usePWAInstall();
  const [selectedPlatform, setSelectedPlatform] = useState<'android' | 'github' | 'ios'>(
    isIOS ? 'ios' : 'github'
  );
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPrameCode, setCopiedPrameCode] = useState(false);
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null);
  const [githubUsername, setGithubUsername] = useState('premjadhav');
  const [githubRepoName, setGithubRepoName] = useState('prame-apk');

  if (!isOpen) return null;

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-k2tx2w4mficbzbfl6iv6wp-23015944067.asia-east1.run.app';

  const cleanUser = (githubUsername || 'premjadhav').trim();
  const cleanRepo = (githubRepoName || 'prame-apk').trim();
  const directGithubReleaseApkUrl = `https://github.com/${cleanUser}/${cleanRepo}/releases/latest/download/AwaazAI-Android-v2.4.apk`;

  const handleCopyUrl = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyPrameCode = () => {
    soundEffects.playSuccess();
    navigator.clipboard.writeText(PRAME_GITHUB_WORKFLOW_CODE);
    setCopiedPrameCode(true);
    setTimeout(() => setCopiedPrameCode(false), 2500);
  };

  const handleDownloadPrameFile = () => {
    soundEffects.playSuccess();
    const blob = new Blob([PRAME_GITHUB_WORKFLOW_CODE], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prame-build-android-apk.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedItem('prame-file');
    setTimeout(() => setDownloadedItem(null), 4000);
  };

  // Direct download of /AwaazAI-Android-v2.4.apk
  const handleDirectDownloadApk = () => {
    soundEffects.playSuccess();
    const a = document.createElement('a');
    a.href = '/AwaazAI-Android-v2.4.apk';
    a.download = 'AwaazAI-Android-v2.4.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadedItem('direct-apk');
    setTimeout(() => setDownloadedItem(null), 4000);
  };

  // Download iOS .mobileconfig Native WebClip Profile
  const handleDownloadIOSProfile = () => {
    soundEffects.playSuccess();
    const a = document.createElement('a');
    a.href = '/AwaazAI-iOS-Installer.mobileconfig';
    a.download = 'AwaazAI-iOS-Installer.mobileconfig';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadedItem('ios-profile');
    setTimeout(() => setDownloadedItem(null), 4000);
  };

  // Download Standalone Portable Android App Launcher (.html)
  const handleDownloadAndroidLauncher = () => {
    soundEffects.playSuccess();
    const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="theme-color" content="#020617" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <title>AwaazAI Mobile App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { width: 100%; height: 100%; background: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: none; display: block; }
    .loader { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #020617; z-index: 10; transition: opacity 0.4s; }
    .spinner { width: 48px; height: 48px; border-radius: 50%; border: 3px solid rgba(34,211,238,0.2); border-top-color: #22d3ee; animation: spin 0.9s linear infinite; margin-bottom: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div id="loader" class="loader">
    <div class="spinner"></div>
    <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 6px;">AwaazAI · J.A.R.V.I.S. Edition</h2>
    <p style="font-size: 12px; color: #94a3b8;">Connecting to Equal AI Neural Voice Engine...</p>
  </div>
  <iframe src="${appUrl}" allow="microphone; autoplay; clipboard-write" onload="document.getElementById('loader').style.opacity='0'; setTimeout(()=>document.getElementById('loader').style.display='none', 400);"></iframe>
</body>
</html>`;

    const blob = new Blob([standaloneHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AwaazAI-Mobile-App-Launcher.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedItem('android-launcher');
    setTimeout(() => setDownloadedItem(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-cyan-950/80 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                GitHub APK Code (prame) & Direct Installer
              </h2>
              <p className="text-xs text-slate-400">
                File <code className="text-emerald-300">/prame</code> in Code Section · GitHub Release APK
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform Switcher Tabs */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-3 gap-2 shrink-0">
          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedPlatform('github');
            }}
            className={`min-h-[44px] px-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              selectedPlatform === 'github'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FolderGit2 className="w-4 h-4 shrink-0" />
            <span>prame (GitHub)</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedPlatform('android');
            }}
            className={`min-h-[44px] px-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              selectedPlatform === 'android'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>Direct APK</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedPlatform('ios');
            }}
            className={`min-h-[44px] px-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              selectedPlatform === 'ios'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Apple className="w-4 h-4 shrink-0" />
            <span>iOS App</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {selectedPlatform === 'github' ? (
            <>
              {/* File /prame Highlight Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-cyan-400 font-semibold">
                      Code Section File Name: <code className="text-emerald-300 font-bold">/prame</code>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      GitHub Auto-APK Builder & Direct Phone Release Code
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Code section me <code className="text-emerald-300 font-bold">prame</code> naam ki file add kar di gayi hai! Is code ko GitHub repo (<code className="text-cyan-300">.github/workflows/build-android-apk.yml</code>) me daalte hi GitHub automatically signed <code className="text-emerald-300">.apk</code> banayega aur direct phone download link dega.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyPrameCode}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {copiedPrameCode ? (
                      <>
                        <Check className="w-4 h-4 shrink-0" />
                        <span>Copied prame Code!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 shrink-0" />
                        <span>Copy GitHub APK Code</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadPrameFile}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>
                      {downloadedItem === 'prame-file'
                        ? 'Downloaded!'
                        : 'Download YAML File'}
                    </span>
                  </button>
                </div>

                <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-44 leading-relaxed">
                  {PRAME_GITHUB_WORKFLOW_CODE}
                </pre>
              </div>

              {/* Custom GitHub Direct Phone APK Download Link Generator */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white">
                    Direct Phone APK Link Generator (GitHub Releases)
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      GitHub Username
                    </label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="premjadhav"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      value={githubRepoName}
                      onChange={(e) => setGithubRepoName(e.target.value)}
                      placeholder="prame-apk"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 break-all">
                  {directGithubReleaseApkUrl}
                </div>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    navigator.clipboard.writeText(directGithubReleaseApkUrl);
                    setDownloadedItem('gh-link');
                    setTimeout(() => setDownloadedItem(null), 2500);
                  }}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {downloadedItem === 'gh-link'
                      ? 'Copied Direct Phone APK Link!'
                      : 'Copy Direct Phone APK Download Link'}
                  </span>
                </button>
              </div>
            </>
          ) : selectedPlatform === 'android' ? (
            <>
              {/* Direct APK File Download Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-cyan-950/50 border border-emerald-500/40 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Direct File · Available in Code Section & Public Root
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    Download AwaazAI-Android-v2.4.apk
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Download the packaged <code className="text-emerald-300">AwaazAI-Android-v2.4.apk</code> file directly or use 1-Tap Native WebAPK install on Android Chrome.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleDirectDownloadApk}
                    className="min-h-[46px] px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>
                      {downloadedItem === 'direct-apk'
                        ? 'Downloaded APK!'
                        : 'Download .APK File'}
                    </span>
                  </button>

                  {isInstallable ? (
                    <button
                      onClick={async () => {
                        soundEffects.playClick();
                        await install();
                      }}
                      className="min-h-[46px] px-3.5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Smartphone className="w-4 h-4 shrink-0" />
                      <span>1-Tap WebAPK Install</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleDownloadAndroidLauncher}
                      className="min-h-[46px] px-3.5 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <FileCode2 className="w-4 h-4 shrink-0" />
                      <span>
                        {downloadedItem === 'android-launcher'
                          ? 'Downloaded App!'
                          : 'Portable App (.html)'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Code Section Files Reference */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white">
                      Available in AI Studio "Code" Section
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400">Ready</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-300 font-bold">/prame</span>
                    <span className="text-[10px] text-emerald-400">GitHub APK Code</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-300">/AwaazAI-Android-v2.4.apk</span>
                    <span className="text-[10px] text-slate-400">Android APK</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300">/.github/workflows/build-android-apk.yml</span>
                    <span className="text-[10px] text-slate-400">Auto-Release CI</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300">/android-apk/AndroidManifest.xml</span>
                    <span className="text-[10px] text-slate-400">Native Manifest</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300">/android-apk/MainActivity.java</span>
                    <span className="text-[10px] text-slate-400">Java Activity</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* iOS iPhone / iPad Native Installation */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/35 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Method 1 · Direct Apple Configuration Profile (.mobileconfig)
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    Download iOS WebClip Installer File
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Download <code className="text-indigo-300">/AwaazAI-iOS-Installer.mobileconfig</code> to install AwaazAI on your iPhone or iPad Home Screen.
                  </p>
                </div>

                <button
                  onClick={handleDownloadIOSProfile}
                  className="w-full min-h-[46px] px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloadedItem === 'ios-profile'
                      ? 'Downloaded AwaazAI-iOS-Installer.mobileconfig!'
                      : 'Download iOS Installer (.mobileconfig)'}
                  </span>
                </button>
              </div>

              {/* Method 2: Safari Add to Home Screen */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Method 2 · Apple Safari 1-Tap Home Screen Install
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    Install via Safari on iPhone & iPad
                  </h3>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs text-slate-200">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      Open the Live App Link below in <strong>Safari</strong> on your iPhone or iPad.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>Tap the</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold">
                        <Share2 className="w-3 h-3" /> Share
                      </span>
                      <span>button at the bottom of Safari.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      Tap <strong>"Add to Home Screen"</strong> → Tap <strong>Add</strong>.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Live Mobile App Link & Compliance Badge */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  Direct Mobile App URL (Open on Phone)
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                APK & iOS Ready
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyUrl}
                className="min-h-[40px] px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
