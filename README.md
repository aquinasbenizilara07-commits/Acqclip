# 🎬 Acqclips — AI Video Clipping & Shorts Generator

> Transform any YouTube video into viral short clips with AI-powered captions, smart framing, and a built-in video editor.

---

## 🚀 Features

- 🎥 **YouTube URL Clipping** — Paste any YouTube link and auto-generate vertical short clips
- 🧠 **AI Caption Generation** — Speech-to-text captions with multiple style presets (Bold, Minimal, Neon, Karaoke, Outline)
- ✂️ **Clip Count Control** — Choose how many clips to generate (1–10)
- ⏱️ **Custom Duration** — Set clip length from 15 to 90 seconds
- 📐 **Resolution Options** — 9:16 (Shorts/Reels), 1:1 (Square), 4:5 (Instagram), 16:9 (Landscape)
- 🎨 **Caption Position** — Place captions at Top, Middle, or Bottom of the video
- 🖥️ **Built-in Video Editor** — Full editor page opens after clipping with live preview
- ⬇️ **One-click Download** — Download any edited clip directly from the browser

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Vanilla CSS, JavaScript |
| Backend | Node.js + Express |
| Video Processing | Python + FFmpeg |
| YouTube Download | yt-dlp |
| Caption Engine | Whisper / FFmpeg drawtext |

---

## ⚙️ Setup & Requirements

### 1. Prerequisites & System Tools

| Software | Version | Purpose | Installation |
|---|---|---|---|
| **Node.js** | v18+ | Express Backend & APIs | [Download Node.js](https://nodejs.org/) (`node -v`) |
| **Python** | 3.10+ | Video processing & Whisper AI | [Download Python](https://www.python.org/) *(Check "Add to PATH")* |
| **FFmpeg** | Latest | Video slicing, rendering, captions | Windows: `winget install Gyan.FFmpeg`<br>Linux: `sudo apt install ffmpeg`<br>Mac: `brew install ffmpeg` |

> [!IMPORTANT]
> Ensure **FFmpeg** and **Python** are both added to your system's `PATH`.

---

### 2. Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/aquinasbenizilara07-commits/Acqclip.git
cd Acqclip

# 2. Install Node.js dependencies
npm install

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. (Recommended) Ensure yt-dlp is up-to-date
pip install --upgrade yt-dlp
```

---

### 3. How to Run

**Option A — Windows One-Click Launcher:**
Double-click `run.bat` (automatically installs missing dependencies and launches the app in your browser).

**Option B — Command Line:**
```bash
node server.js
```

Then navigate to **http://localhost:3000** in your browser.

---

## 📖 How to Use

1. **Paste a YouTube URL** into the input field on the homepage
2. **Set your preferences** — number of clips, duration, resolution
3. **Click "Generate Clips"** — the AI downloads and processes the video
4. **Edit in the Studio** — the editor opens automatically after processing
5. **Customize captions** — pick a caption style and position
6. **Download** — click the download button on any clip

---

## 📁 Project Structure

```
Acqclip/
├── index.html          # Main landing + clip generator page
├── editor.html         # Video editor studio page
├── server.js           # Express backend + API routes
├── clip_engine.py      # Python clip generation engine (yt-dlp + FFmpeg)
├── package.json        # Node dependencies
├── klap_style1.css     # Core stylesheet
├── klap_style2.css     # Supplementary styles
└── public/             # Static assets (SVGs, icons)
```

---

## 🔮 Roadmap

- [ ] Whisper AI integration for accurate auto-captions
- [ ] B-roll auto-insertion
- [ ] Multi-language caption support
- [ ] Cloud storage for generated clips
- [ ] TikTok / Instagram direct publishing

---

## 🏷️ Keywords

`AI Video Clipping` • `YouTube Shorts Generator` • `Auto Captions` • `FFmpeg` • `yt-dlp` • `Node.js` • `Acqclips`
