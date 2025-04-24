# 📱 Next.js + Capacitor Mobile App

A cross-platform mobile application built with **Next.js** and packaged into native Android/iOS apps using **Capacitor.js**.  

---

## 📦 Tech Stack

- ⚡️ [Next.js](https://nextjs.org/)
- 📱 [Capacitor](https://capacitorjs.com/)
- 📱 Android Studio / Xcode for native builds

---

## 🚀 Getting Started

### 📦 Install Dependencies

```bash
npm install

🔧 Run in Development
      npm run dev

🏗️ Build for Production
      npm run build

📲 Capacitor Setup
      npx cap copy

Open native project 
    npx cap open android   # For Android Studio
    npx cap open ios       # For Xcode (on macOS)


Build and open Native Project
    npm run build && npx cap open android         # For Android Studio
    npm run build && npx cap open ios             # For Xcode (on macOS)
