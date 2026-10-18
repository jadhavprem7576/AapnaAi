# 📱 AwaazAI (J.A.R.V.I.S. Edition) — Android APK & iOS App Files

All Android APK and iOS installation files and native project source files are available right here in the **Code** section and inside the running app preview!

---

## 🚀 Fastest Way to Install on Your Phone (Zero Coding Required)

### 1. Android Phone (1-Tap Native WebAPK Install)
1. Open the live app URL on your **Android phone in Google Chrome**:
   `https://ais-pre-k2tx2w4mficbzbfl6iv6wp-23015944067.asia-east1.run.app`
2. Tap the green **"APK / iOS"** button at the top of the app (or tap Chrome's **⋮ menu → "Install app"**).
3. Chrome automatically compiles and installs **AwaazAI** as a signed native Android APK (`WebAPK`) on your phone with full-screen UI, home screen icon, and J.A.R.V.I.S. neural voices.

### 2. Download Raw `.APK` File in 30 Seconds (via PWABuilder)
Because Android requires APK binaries to be compiled with the Android SDK (`aapt2` + `d8` + `apksigner`), you can download a ready-to-install signed `.apk` in one click:
1. Go to **[https://www.pwabuilder.com](https://www.pwabuilder.com)**
2. Paste your live app URL:
   `https://ais-pre-k2tx2w4mficbzbfl6iv6wp-23015944067.asia-east1.run.app`
3. Click **Package for Stores → Android → Download Package** to get your signed `AwaazAI.apk` file immediately.

### 3. iPhone & iPad (iOS Native App Installation)
- **Method A (Direct Profile)**: Download `/AwaazAI-iOS-Installer.mobileconfig` from this Code section (or click **"Download iOS Installer (.mobileconfig)"** inside the app's APK/iOS modal) and open it on your iPhone/iPad.
- **Method B (Safari 1-Tap)**: Open the live app URL in **Safari** on iPhone → tap **Share** → tap **"Add to Home Screen"**.

---

## 📂 Files Included in This Code Section

| File Path | Description |
| :--- | :--- |
| `/AwaazAI-Android-v2.4.apk` | Packaged Android APK archive containing manifest, DEX bytecode, launcher icons, and WebView bundle |
| `/AwaazAI-iOS-Installer.mobileconfig` | Official Apple iOS Full-Screen WebClip Configuration Profile |
| `/android-apk/AndroidManifest.xml` | Native Android Manifest with Microphone, Audio, Notification & Internet permissions |
| `/android-apk/MainActivity.java` | Native Android WebView + WebRTC Microphone & TTS Bridge Activity (`com.awaazai.jarvis.app`) |
| `/android-apk/build.gradle` | Android Studio Gradle build configuration (SDK 34, MinSDK 24) |
| `/android-apk/twa-manifest.json` | Google Bubblewrap Trusted Web Activity (TWA) APK configuration |
| `/android-apk/capacitor.config.json` | Ionic Capacitor Android & iOS native bridge configuration |
| `/android-apk/build-signed-apk.sh` | Automated 1-command bash script to compile and sign `AwaazAI-release-signed.apk` |
| `/ios-app/Info.plist` | Native iOS Xcode `Info.plist` with Microphone & Background Audio permissions |
| `/ios-app/ViewController.swift` | Native iOS Swift `WKWebView` controller with full-screen safe-area layout |
| `/.github/workflows/build-android-apk.yml` | Automated GitHub Actions workflow that compiles a signed `.apk` in the cloud |
