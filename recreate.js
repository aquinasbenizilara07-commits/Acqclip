const fs = require('fs');

const html = fs.readFileSync('e:/REA/klapacq/extracted_klap.html', 'utf8');

// Extract the core layout from header to footer
const startIdx = html.indexOf('<header class="h-12');
const endIdx = html.indexOf('</footer>') + '</footer>'.length;

let bodyContent = html.substring(startIdx, endIdx);

// Clean up Next.js hydration artifacts or specific attributes if needed
// Update logo paths to point to public/svg/logos and local assets
bodyContent = bodyContent.replace(/mask-image:url\(\'\/svg\/logos\/([^\']+)\'\)/g, "mask-image:url('public/svg/logos/$1')");
bodyContent = bodyContent.replace(/-webkit-mask-image:url\(\'\/svg\/logos\/([^\']+)\'\)/g, "-webkit-mask-image:url('public/svg/logos/$1')");
bodyContent = bodyContent.replace(/src="\/svg\/Klap_logo.svg"/g, 'src="public/svg/Klap_logo.svg"');

// Construct full standalone, clean modern HTML document
const fullHtml = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth bg-white font-sans antialiased">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Video Tools for Creators | Klap</title>
  <meta name="description" content="Klap's free AI video tools help you generate shorts, resize, crop, transcribe, translate and add subtitles in a click — turn any long video into ready-to-post TikToks, Reels and YouTube Shorts." />
  
  <!-- Modern Typography Google Fonts: Plus Jakarta Sans / Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  
  <!-- Shipped Original Tailwind Production Stylesheets -->
  <link rel="stylesheet" href="klap_style1.css" />
  <link rel="stylesheet" href="klap_style2.css" />

  <style>
    :root {
      --font-sans: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    body {
      font-family: var(--font-sans);
      color: #020617;
      background-color: #ffffff;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    
    /* Smooth interactive transitions */
    .group {
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
    }
    .group:hover {
      transform: translateY(-4px);
    }
    .group:hover .bg-slate-150 {
      background-color: #e2e8f0;
    }
    .group:hover video {
      transform: scale(1.02);
    }
    video {
      transition: transform 0.3s ease;
    }

    /* Marquee animation */
    @keyframes marquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      display: flex;
      width: max-content;
      animation: marquee 35s linear infinite;
    }
    .animate-marquee:hover {
      animation-play-state: paused;
    }

    /* Sticky subnav styling */
    .tools-subnav {
      border-bottom: 1px solid #f1f5f9;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    /* Smooth video preview controls */
    .video-card-preview {
      background: #f1f5f9;
      border-radius: 1rem;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 1.5rem;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
      position: relative;
    }

    /* Floating header blur */
    header {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      background: rgba(255, 255, 255, 0.92);
      border-bottom: 1px solid rgba(226, 232, 240, 0.6);
    }

    /* Quick category pill navigation bar */
    .category-pills-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding: 0.75rem 1rem;
      max-width: 1500px;
      margin: 0 auto;
      scrollbar-width: none;
    }
    .category-pills-bar::-webkit-scrollbar {
      display: none;
    }
    .category-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.875rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 9999px;
      white-space: nowrap;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .category-pill:hover {
      color: #7c3aed;
      border-color: #c4b5fd;
      background: #f5f3ff;
      transform: translateY(-1px);
    }
    .category-pill.active {
      color: #ffffff;
      background: #7c3aed;
      border-color: #7c3aed;
    }
  </style>
</head>
<body class="w-full h-full text-slate-950">
  <!-- Reconstructed Header -->
  ` + bodyContent + `

  <!-- Interactive script to auto-play videos on hover/intersection and toggle category jumps -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // Auto-play videos when they come into viewport and on hover
      const videos = document.querySelectorAll('video');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.25 });

      videos.forEach(video => {
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        observer.observe(video);
      });

      // Mobile menu toggle
      const mobileMenuBtn = document.querySelector('button[aria-label="Menu"]');
      const mobileNav = mobileMenuBtn ? mobileMenuBtn.nextElementSibling : null;
      if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
          const isHidden = mobileNav.classList.contains('hidden');
          if (isHidden) {
            mobileNav.classList.remove('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
          } else {
            mobileNav.classList.add('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync('e:/REA/klapacq/index.html', fullHtml, 'utf8');
console.log('Successfully created e:/REA/klapacq/index.html, size:', fullHtml.length);
