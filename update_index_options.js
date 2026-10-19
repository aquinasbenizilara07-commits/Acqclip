const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add interactive options container right under the form input
const oldFormEnd = '</form>';
const newControls = `</form>

      <!-- Step 2: Interactive Prompt (Number of Clips & Caption Position) -->
      <div id="pre-clip-options" class="mt-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xl text-left transition-all">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h4 class="text-sm font-bold text-slate-900">Customize Clipping Setup</h4>
          </div>
          <span class="text-xs text-violet-600 font-semibold bg-violet-50 px-2.5 py-0.5 rounded-full">AI Speech Engine Ready</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <!-- Number of Clips -->
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              How many clips to create?
            </label>
            <div class="grid grid-cols-4 gap-2">
              <button type="button" onclick="setIndexNumClips(2, this)" class="idx-clip-btn py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:border-violet-500 transition-all">2 Clips</button>
              <button type="button" onclick="setIndexNumClips(4, this)" class="idx-clip-btn active py-2 text-xs font-semibold rounded-xl border border-violet-600 bg-violet-600 text-white shadow-sm transition-all">4 Clips</button>
              <button type="button" onclick="setIndexNumClips(6, this)" class="idx-clip-btn py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:border-violet-500 transition-all">6 Clips</button>
              <button type="button" onclick="setIndexNumClips(8, this)" class="idx-clip-btn py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:border-violet-500 transition-all">8 Clips</button>
            </div>
          </div>

          <!-- Caption Position Adjuster: Up, Middle, Down -->
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
              Caption Position (Adjuster)
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button type="button" onclick="setIndexCaptionPos('up', this)" class="idx-pos-btn py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:border-emerald-500 flex flex-col items-center gap-1 transition-all">
                <div class="w-5 h-2 bg-slate-300 rounded-sm mb-0.5"></div>
                <span>Up (Top)</span>
              </button>
              <button type="button" onclick="setIndexCaptionPos('middle', this)" class="idx-pos-btn py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:border-emerald-500 flex flex-col items-center gap-1 transition-all">
                <div class="w-5 h-2 bg-slate-300 rounded-sm mb-0.5"></div>
                <span>Middle</span>
              </button>
              <button type="button" onclick="setIndexCaptionPos('down', this)" class="idx-pos-btn active py-2 text-xs font-semibold rounded-xl border border-emerald-600 bg-emerald-600 text-white shadow-sm flex flex-col items-center gap-1 transition-all">
                <div class="w-5 h-2 bg-white rounded-sm mb-0.5"></div>
                <span>Down (Bottom)</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;

if (html.includes(oldFormEnd)) {
  html = html.replace(oldFormEnd, newControls);
}

// 2. Add client side functions for selections and include them in fetch payload
const scriptInsertMarker = 'let activePollInterval = null;';
const newScriptVariables = `let activePollInterval = null;
    let selectedNumClips = 4;
    let selectedCaptionPos = 'down';

    function setIndexNumClips(num, el) {
      selectedNumClips = num;
      document.querySelectorAll('.idx-clip-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-violet-600', 'text-white', 'border-violet-600', 'shadow-sm');
        btn.classList.add('border-slate-200', 'text-slate-700');
      });
      el.classList.add('active', 'bg-violet-600', 'text-white', 'border-violet-600', 'shadow-sm');
      el.classList.remove('border-slate-200', 'text-slate-700');
    }

    function setIndexCaptionPos(pos, el) {
      selectedCaptionPos = pos;
      document.querySelectorAll('.idx-pos-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-emerald-600', 'text-white', 'border-emerald-600', 'shadow-sm');
        btn.classList.add('border-slate-200', 'text-slate-700');
        const bar = btn.querySelector('div');
        if (bar) bar.className = 'w-5 h-2 bg-slate-300 rounded-sm mb-0.5';
      });
      el.classList.add('active', 'bg-emerald-600', 'text-white', 'border-emerald-600', 'shadow-sm');
      el.classList.remove('border-slate-200', 'text-slate-700');
      const bar = el.querySelector('div');
      if (bar) bar.className = 'w-5 h-2 bg-white rounded-sm mb-0.5';
    }`;

html = html.replace(scriptInsertMarker, newScriptVariables);

// 3. Update handleGenerateClips payload
html = html.replace(
  "body: JSON.stringify({ url: urlValue })",
  "body: JSON.stringify({ url: urlValue, num_clips: selectedNumClips, caption_position: selectedCaptionPos })"
);

html = html.replace(
  "formData.append('video_file', selectedLocalFile);",
  "formData.append('video_file', selectedLocalFile);\n          formData.append('num_clips', selectedNumClips);\n          formData.append('caption_position', selectedCaptionPos);"
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with interactive clip counter and caption position adjuster!');
