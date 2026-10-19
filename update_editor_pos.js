const fs = require('fs');
let html = fs.readFileSync('editor.html', 'utf8');

// 1. Add Caption Position (Up, Middle, Down) controls after Section 1: Caption Styles
const positionControls = `
      <!-- Section 1.5: Caption Position (Up, Middle, Down) -->
      <div>
        <label class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
          <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
          Caption Position (Adjuster)
        </label>
        <div class="grid grid-cols-3 gap-2">
          <!-- Up / Top -->
          <button type="button" onclick="setEditorCaptionPos('up', this)" class="caption-pos-card py-2 text-xs font-semibold rounded-xl border border-slate-700/70 bg-slate-800/40 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all">
            <div class="w-5 h-2 bg-slate-500 rounded-sm mb-0.5"></div>
            <span>Up (Top)</span>
          </button>

          <!-- Middle / Center -->
          <button type="button" onclick="setEditorCaptionPos('middle', this)" class="caption-pos-card py-2 text-xs font-semibold rounded-xl border border-slate-700/70 bg-slate-800/40 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all">
            <div class="w-5 h-2 bg-slate-500 rounded-sm mb-0.5"></div>
            <span>Middle</span>
          </button>

          <!-- Down / Bottom (Default) -->
          <button type="button" onclick="setEditorCaptionPos('down', this)" class="caption-pos-card active py-2 text-xs font-semibold rounded-xl border border-emerald-500 bg-emerald-500/20 text-emerald-300 flex flex-col items-center gap-1 transition-all">
            <div class="w-5 h-2 bg-emerald-400 rounded-sm mb-0.5"></div>
            <span>Down (Bottom)</span>
          </button>
        </div>
      </div>
`;

if (html.includes('<!-- Section 2: Video Resolution & Aspect Ratio -->')) {
  html = html.replace('<!-- Section 2: Video Resolution & Aspect Ratio -->', positionControls + '\n      <!-- Section 2: Video Resolution & Aspect Ratio -->');
}

// 2. Add position logic to editor javascript
const oldState = 'let selectedNumClips = 4;';
const newState = 'let selectedNumClips = 4;\n    let selectedCaptionPosition = "down";';
html = html.replace(oldState, newState);

const positionFunc = `
    function setEditorCaptionPos(pos, el) {
      selectedCaptionPosition = pos;
      document.querySelectorAll('.caption-pos-card').forEach(btn => {
        btn.classList.remove('active', 'border-emerald-500', 'bg-emerald-500/20', 'text-emerald-300');
        btn.classList.add('border-slate-700/70', 'bg-slate-800/40', 'text-slate-300');
        const b = btn.querySelector('div');
        if (b) b.className = 'w-5 h-2 bg-slate-500 rounded-sm mb-0.5';
      });
      el.classList.add('active', 'border-emerald-500', 'bg-emerald-500/20', 'text-emerald-300');
      el.classList.remove('border-slate-700/70', 'bg-slate-800/40', 'text-slate-300');
      const b = el.querySelector('div');
      if (b) b.className = 'w-5 h-2 bg-emerald-400 rounded-sm mb-0.5';

      // Update live overlay positioning on the video canvas
      const overlayBox = document.getElementById('caption-overlay');
      if (overlayBox) {
        overlayBox.classList.remove('bottom-16', 'top-16', 'top-1/2', '-translate-y-1/2');
        if (pos === 'up') {
          overlayBox.style.top = '14%';
          overlayBox.style.bottom = 'auto';
        } else if (pos === 'middle') {
          overlayBox.style.top = '45%';
          overlayBox.style.bottom = 'auto';
        } else {
          overlayBox.style.top = 'auto';
          overlayBox.style.bottom = '4rem';
        }
      }
    }
`;

html = html.replace('function selectCaptionStyle(style, el) {', positionFunc + '\n    function selectCaptionStyle(style, el) {');

// 3. Include caption_position in payload for applyAndReclip
html = html.replace(
  'caption_style: selectedCaptionStyle\n        };',
  'caption_style: selectedCaptionStyle,\n          caption_position: selectedCaptionPosition\n        };'
);

// 4. Also handle job settings restoration
html = html.replace(
  'selectedNumClips = parseInt(data.settings.num_clips || selectedNumClips);',
  'selectedNumClips = parseInt(data.settings.num_clips || selectedNumClips);\n          selectedCaptionPosition = data.settings.caption_position || selectedCaptionPosition;'
);

fs.writeFileSync('editor.html', html, 'utf8');
console.log('editor.html successfully updated with caption position adjuster!');
