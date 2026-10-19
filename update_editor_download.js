const fs = require('fs');
let html = fs.readFileSync('editor.html', 'utf8');

// 1. Add prominent download bar directly below the canvas video timeline
const oldControlBar = `      <!-- Video Control Bar / Timeline Scrub Info -->
      <div class="mt-4 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-800 text-xs text-slate-400">
        <span id="playback-time">00:00 / 00:30</span>
        <span class="w-1 h-1 bg-slate-600 rounded-full"></span>
        <span id="aspect-label">Aspect: 9:16 (720x1280)</span>
        <span class="w-1 h-1 bg-slate-600 rounded-full"></span>
        <span id="caption-style-label" class="text-violet-400 font-medium">Style: Alex Hormozi</span>
        <span class="w-1 h-1 bg-slate-600 rounded-full"></span>
        <span id="transcript-count" class="text-emerald-400 font-medium">Transcripts synced</span>
      </div>`;

const newControlBar = `      <!-- Video Control Bar / Timeline Scrub Info -->
      <div class="mt-4 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-800 text-xs text-slate-400">
        <span id="playback-time">00:00 / 00:30</span>
        <span class="w-1 h-1 bg-slate-600 rounded-full"></span>
        <span id="aspect-label">Aspect: 9:16 (720x1280)</span>
        <span class="w-1 h-1 bg-slate-600 rounded-full"></span>
        <span id="caption-style-label" class="text-violet-400 font-medium">Style: Alex Hormozi</span>
        <span class="w-1 h-1 bg-slate-600 rounded-full"></span>
        <span id="transcript-count" class="text-emerald-400 font-medium">Transcripts synced</span>
      </div>

      <!-- Prominent Main Download Action Bar -->
      <div class="mt-4 flex items-center gap-3">
        <a id="main-canvas-download-btn" href="#" download class="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          <span id="main-download-label">Download Active Clip</span>
        </a>
        <button onclick="downloadAllClips()" class="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5" title="Download all generated clips in this batch">
          <svg class="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"/></svg>
          Download All Clips
        </button>
      </div>`;

html = html.replace(oldControlBar, newControlBar);

// 2. Add individual download button to each sidebar clip card
const oldSidebarCard = `<div class="flex items-center justify-between text-[10px] text-slate-400 mt-2">
            <span class="font-medium text-emerald-400">\${clip.duration}</span>
            <span class="text-violet-400 font-medium">Select &rarr;</span>
          </div>`;

const newSidebarCard = `<div class="flex items-center justify-between text-[10px] text-slate-400 mt-2">
            <span class="font-medium text-emerald-400">\${clip.duration}</span>
            <span class="text-violet-400 font-medium">Select &rarr;</span>
          </div>
          <a href="\${clip.url}" download="\${clip.filename || 'clip_' + clip.id + '.mp4'}" onclick="event.stopPropagation();" class="mt-2.5 w-full py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors no-underline">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download Clip \${clip.id}
          </a>`;

html = html.replace(oldSidebarCard, newSidebarCard);

// 3. Update selectClip to also bind main-canvas-download-btn
const oldSelectClipDownload = `const downloadBtn = document.getElementById('current-download-btn');
      downloadBtn.href = clip.url;
      downloadBtn.download = clip.filename || \`clip_\${clip.id}.mp4\`;`;

const newSelectClipDownload = `const downloadBtn = document.getElementById('current-download-btn');
      downloadBtn.href = clip.url;
      downloadBtn.download = clip.filename || \`clip_\${clip.id}.mp4\`;

      const mainCanvasBtn = document.getElementById('main-canvas-download-btn');
      if (mainCanvasBtn) {
        mainCanvasBtn.href = clip.url;
        mainCanvasBtn.download = clip.filename || \`clip_\${clip.id}.mp4\`;
        document.getElementById('main-download-label').innerText = \`Download Clip \${clip.id} (\${clip.duration})\`;
      }`;

html = html.replace(oldSelectClipDownload, newSelectClipDownload);

// 4. Add downloadAllClips helper function
const downloadAllFunc = `
    function downloadAllClips() {
      if (!currentJob || !currentJob.clips || currentJob.clips.length === 0) {
        alert('No clips available to download.');
        return;
      }
      currentJob.clips.forEach((c, i) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = c.url;
          a.download = c.filename || ('clip_' + c.id + '.mp4');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, i * 400);
      });
    }
`;

html = html.replace('function selectClip(idx) {', downloadAllFunc + '\n    function selectClip(idx) {');

fs.writeFileSync('editor.html', html, 'utf8');
console.log('Successfully enhanced editor.html with prominent Download buttons!');
