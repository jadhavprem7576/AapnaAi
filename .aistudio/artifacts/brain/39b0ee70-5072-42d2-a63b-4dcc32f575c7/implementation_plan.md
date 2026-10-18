# AwaazAI — GitHub APK Cloud Builder & Direct Phone Download Studio

Enable users to push or upload ready-to-build Android APK and iOS project code directly to GitHub so GitHub Actions automatically compiles a signed `.apk` and publishes it to GitHub Releases and a mobile download page for one-tap installation on any phone.

## User Review & Critical Decisions

> [!IMPORTANT]
> Because the clarifying questions were skipped, this plan uses the recommended defaults so you get both a ready-to-use GitHub Actions cloud APK compiler and an interactive in-app **GitHub APK Code Studio** where you can copy or download every required code block and setup script in one tap.

- **Confirmed Decision 1 (APK Architecture)**: Hybrid Capacitor + Standalone WebView Android build configuration that bundles the UI assets for instant offline startup while connecting to the live Gemini TTS and AI Call Screening endpoints.
- **Confirmed Decision 2 (Phone Download Delivery)**: Automated GitHub Actions workflow that compiles a signed release `.apk` on every push (or manual trigger) and publishes it directly to **GitHub Releases** (`latest/download/AwaazAI-Android-v2.4.apk`) with an auto-generated mobile QR code and direct download URL.
- **Confirmed Decision 3 (In-App GitHub Code Exporter)**: Dedicated **GitHub APK Code** tab inside the app's APK & iOS Download Hub featuring syntax-formatted code viewers, one-tap **Copy Code** buttons, **Download File** actions for every GitHub/Android file, and a 3-step visual guide in Hindi/Hinglish and English.

---

## 1. Overview & Core Concept

- **What It Does**: Provides the complete source code, GitHub Actions CI/CD pipeline, Android Gradle/Manifest configuration, and an interactive in-app **GitHub to Phone APK Studio** so the user can either download the pre-built APK directly or host their own automated APK build pipeline on GitHub for permanent one-click phone downloads.
- **Target Audience / Persona**: Mobile-first users and creators who want to install AwaazAI (J.A.R.V.I.S. & Indian Voice Assistant) as a real Android `.apk` on their phone via GitHub without needing to install Android Studio or heavy SDKs on a computer.
- **Key Value**: Eliminates local Android SDK setup entirely—GitHub's cloud servers compile and sign the Android APK automatically and provide a direct `.apk` download link for any Android phone.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Open GitHub APK Code Studio**: User taps the prominent **APK / iOS** button in the top bar or the home banner and selects the **GitHub APK Code** tab.
  2. **Copy or Download GitHub Workflow & Android Code**: User browses the interactive code viewer tabs (GitHub Actions Workflow YAML, Android Manifest XML, MainActivity Java WebView Bridge, Gradle Build Config, and Capacitor Config), with one-tap **Copy Code** and **Download File** controls.
  3. **Generate Direct GitHub Release Phone Link**: User enters their GitHub username and repository name into the interactive **GitHub Direct APK Link & QR Generator** to immediately get their custom `https://github.com/<username>/<repo>/releases/latest/download/AwaazAI-Android-v2.4.apk` link and scannable mobile QR code.
  4. **One-Tap Direct APK Download**: User can also tap the instant **Download Pre-Built APK** button right inside the studio to download the packaged `.apk` immediately without waiting.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Tactical mobile-first dark interface inspired by Equal AI, Truecaller Assistant, and J.A.R.V.I.S. HUD precision.
  - *Color Palette & Mood*:
    - Dominant Canvas (60%): Deep Obsidian Slate (`#020617` / `bg-slate-950`)
    - Structural Surfaces (30%): Elevated Carbon Cards (`#0f172a` / `bg-slate-900`) with subtle hairline borders (`border-slate-800`)
    - Accent Budget (10%): Emerald APK Action (`#10b981`), Cyan J.A.R.V.I.S. Arc (`#06b6d4`), and Indigo Primary Controls (`#6366f1`)
  - *Typography & Hierarchy*: `Plus Jakarta Sans` for crisp UI headings and controls, paired with `Noto Sans Devanagari` for Hindi/Marathi scripts and `monospace` (`tabular-nums`) for code blocks, SHA-256 signatures, and build commands.
  - *Component Styling & Layout*: Ergonomic $44\text{px}+$ touch hitboxes, clean segmented tab selectors, and zero-pill unboxed metadata with middle-dot (`·`) separators.

- **Interactive Feedback & Motion**:
  - Instant clipboard copy confirmation states (`Copied to Clipboard!`) settling within $150\text{ms}$.
  - Live interactive QR code and direct release URL preview that updates dynamically as the user types their GitHub username and repository name.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Cloud APK Compilation via GitHub Actions + Release Publishing**
  - *Chosen Approach*: Configure the GitHub Actions workflow using `ubuntu-latest`, JDK 17, Android SDK Tools, and `softprops/action-gh-release` so every push compiles, signs (with V1/V2 JAR & APK signatures), and attaches `AwaazAI-Android-v2.4.apk` directly to GitHub Releases.
  - *Why*: Users can open their GitHub Release URL on any Android phone browser and download the `.apk` directly with zero computer setup required.
  - *Alternatives Considered*: Local Android Studio builds (rejected because it requires downloading 10GB+ of tools on a PC).

- **Decision 2: Interactive In-App Code Viewer + All-in-One Setup Script**
  - *Chosen Approach*: Embed all GitHub Actions and Android native code directly inside an interactive viewer in the app UI, alongside a single-command setup script and individual file download triggers.
  - *Why*: Makes the code immediately visible, copyable, and downloadable on both mobile phones and desktop browsers even without opening an IDE.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AwaazAI Mobile App & Top Bar CTA                     │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 APK & GitHub Cloud Builder Modal Hub                    │
├──────────────────────┬─────────────────────────┬────────────────────────┤
│  Direct Android APK  │   GitHub APK Code &     │    iOS Installer &     │
│  & QR Download Tab   │  Release Link Generator │   Swift Project Tab    │
└──────────┬───────────┴────────────┬────────────┴───────────┬────────────┘
           │                        │                        │
           ▼                        ▼                        ▼
┌──────────────────────┐ ┌───────────────────────┐ ┌──────────────────────┐
│ Instant Binary .APK  │ │ Interactive Code Tabs │ │ .mobileconfig &      │
│ Stream & Web Share   │ │ • GitHub Actions YAML │ │ WKWebView Swift Code │
│                      │ │ • AndroidManifest.xml │ │                      │
│                      │ │ • MainActivity.java   │ │                      │
│                      │ │ • build.gradle        │ │                      │
│                      │ │ • Custom Repo QR Gen  │ │                      │
└──────────────────────┘ └───────────────────────┘ └──────────────────────┘
```

- **Data Model & State**:
  - `activePlatformTab`: Switches cleanly between `'android'`, `'github'`, and `'ios'` views inside the installer modal.
  - `selectedCodeFile`: Tracks which GitHub/Android source file is active in the syntax code viewer (`workflow`, `manifest`, `mainActivity`, `gradle`, `capacitor`, `bashScript`).
  - `githubUser` & `githubRepo`: Reactive state powering the live **GitHub Direct Phone APK URL & QR Code Generator** (`https://github.com/{user}/{repo}/releases/latest/download/AwaazAI-Android-v2.4.apk`).

- **Interactive Component & State Mapping**:
  - **Code File Selector Tabs**: Switching tabs updates the displayed code block, file description, target GitHub path, and individual **Copy Code** / **Download File** buttons.
  - **GitHub Release Link & QR Generator**: Typing a GitHub username and repo name dynamically computes the exact GitHub Release direct `.apk` download link, GitHub Actions run URL, and renders a scannable QR code for immediate phone testing.
  - **One-Click Bundle Script**: Copies a complete shell script that initializes a Git repo, creates all Android + GitHub workflow files, and pushes them to GitHub in one step.
