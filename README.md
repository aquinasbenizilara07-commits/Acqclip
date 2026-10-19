<div align="center">
  <a href="https://youtu.be/aaSQVqEa6U4">
    <img src="https://img.youtube.com/vi/aaSQVqEa6U4/0.jpg" alt="Clone ANY Website UI in Seconds! (REA AI Agent Setup)">
  </a>
  <h3>📺 <a href="https://youtu.be/aaSQVqEa6U4">Watch the full tutorial on YouTube</a></h3>
</div>

# 💳 REA Chrome CDP Web Reverse-Engineering: Stripe-Style Pricing Page

> Passive browser inspection and UI reconstruction of ultra-clean, high-converting SaaS pricing layouts using **REA (Reverse Engineer Anything)** and **Chrome DevTools Protocol (CDP)**.

---

## ⚡ 1. Autonomous Agent Setup (No Manual Commands Needed)

Instead of manually running terminal setup commands, simply paste this prompt into your **Antigravity AI Agent** to configure REA automatically:

```text
Please run terminal commands to install `rea-agents` globally (`npm install --global rea-agents`) and execute `rea setup` to configure REA MCP integrations for Antigravity.
```

---

## 🌐 2. Launch Chrome Debug Mode (3 Target Inspiration Examples)

Run **one** of the commands below in PowerShell to launch Chrome on debug port `9222` with a pre-loaded target site:

* 💳 **Example 1: Stripe Pricing Page (Recommended)**
  ```powershell
  & "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug-profile" https://stripe.com/pricing
  ```
* ⚡ **Example 2: Linear App Pricing Page**
  ```powershell
  & "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug-profile" https://linear.app/pricing
  ```
* 🚀 **Example 3: Vercel Pricing Page**
  ```powershell
  & "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug-profile" https://vercel.com/pricing
  ```

---

## 🤖 3. Master AI Agent Prompt (Brief & Direct)

> Copy and paste this prompt into your **Antigravity AI Agent** chat:

```text
You are a front-end architect. Connect to local Chrome debug port 9222 using REA tools (`rea list-browser-targets`, `rea inspect-web-page`) to inspect the active tab's layout and CSS structure.

Reconstruct a clean, responsive single-file "Stripe-Style" SaaS Pricing Page featuring:
1. Animated Monthly/Yearly billing toggle switch.
2. 3 tiered pricing cards with middle "Pro" tier highlighted (scale/shadow).
3. Collapsible FAQ accordion section.

Save the final output directly as `outputs/index.html`.
```

---

## 🚀 4. Open Final Output in Browser

After your Antigravity agent finishes generating the file, run this **single command** to open the reconstructed UI in your browser:

```powershell
Start-Process outputs/index.html
```

---

## 🌟 3 Practical Developer Workflows

- 🖥️ **Desktop App Blueprint**: Extract search & database logic from closed-source Electron `.asar` apps without source code.
- 🌐 **Live Web Page Cloning**: Passively inspect Chrome DOM layouts & CSS styling via debug port (`9222`).
- 📱 **Android & File Unpacking**: Decompile Android APKs or firmware blobs to extract API endpoints.

---

## 🔮 5 Future Roadmap Features

- 🎨 **Automated CSS Token Extraction**: Auto-generate custom CSS design tokens (`:root { --brand-color: ... }`).
- 🌓 **Dark Mode Auto-Synthesis**: Passive extraction of light/dark theme class variants.
- 📊 **State Flow Graphing**: Capture intermediate DOM state transitions during user clicks.
- 📦 **Tailwind Component Exporter**: Export extracted layouts directly into Tailwind CSS or React primitives.
- 🤖 **Direct MCP Context Sync**: Automatically push captured DOM snapshots to Cursor and Claude Code.

---

## 🏷️ Keywords & SEO
`REA AI Agent` • `Chrome DevTools Protocol` • `CDP Web Reverse Engineering` • `Website UI Cloner` • `Stripe Pricing Page Clone` • `Antigravity AI` • `Web Scraping & DOM Inspection` • `Automated Front-End Architecture`
