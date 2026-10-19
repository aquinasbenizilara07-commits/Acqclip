const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Replace the two-column grid with a three-column grid containing:
// Col 1: How many clips to create?
// Col 2: Clip Time Duration (15s, 30s, 45s, 60s or custom slider)
// Col 3: Caption Position (Up, Middle, Down)

const oldOptionsSection = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">`;

const newOptionsSection = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">`;

html = html.replace(oldOptionsSection, newOptionsSection);

// Add the Clip Time Duration column between Number of Clips and Caption Position
const oldClipColEnd = `              <button type="button" onclick="setIndexNumClips(8, this)" class="idx-clip-btn py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:border-violet-500 transition-all">8 Clips</button>
            </div>
          </div>`;

const durationCol = `              <button type="button" onclick="setIndexNumClips(8, this)" class="idx-clip-btn py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:border-violet-500 transition-all">8 Clips</button>
            </div>
          </div>

          <!-- Time Duration of Clips -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Clip Time Duration
              </label>
              <span id="idx-duration-badge" class="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">30 seconds</span>
            </div>
            <div class="grid grid-cols-4 gap-2 mb-2">
              <button type="button" onclick="setIndexDurationPreset(15, this)" class="idx-dur-btn py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:border-sky-500 transition-all">15s</button>
              <button type="button" onclick="setIndexDurationPreset(30, this)" class="idx-dur-btn active py-2 text-xs font-semibold rounded-xl border border-sky-600 bg-sky-600 text-white shadow-sm transition-all">30s</button>
              <button type="button" onclick="setIndexDurationPreset(45, this)" class="idx-dur-btn py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:border-sky-500 transition-all">45s</button>
              <button type="button" onclick="setIndexDurationPreset(60, this)" class="idx-dur-btn py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:border-sky-500 transition-all">60s</button>
            </div>
            <input type="range" id="idx-duration-slider" min="15" max="60" step="5" value="30" oninput="setIndexDurationSlider(this.value)" class="w-full accent-sky-500 bg-slate-100 h-1.5 rounded-lg cursor-pointer" />
          </div>`;

html = html.replace(oldClipColEnd, durationCol);

// 2. Add duration script logic & include in request payload
const scriptTarget = "let selectedCaptionPos = 'down';";
const scriptReplacement = `let selectedCaptionPos = 'down';
    let selectedDuration = 30;

    function setIndexDurationPreset(sec, el) {
      selectedDuration = parseInt(sec);
      document.getElementById('idx-duration-badge').innerText = sec + ' seconds';
      document.getElementById('idx-duration-slider').value = sec;
      document.querySelectorAll('.idx-dur-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-sky-600', 'text-white', 'border-sky-600', 'shadow-sm');
        btn.classList.add('border-slate-200', 'text-slate-700');
      });
      el.classList.add('active', 'bg-sky-600', 'text-white', 'border-sky-600', 'shadow-sm');
      el.classList.remove('border-slate-200', 'text-slate-700');
    }

    function setIndexDurationSlider(val) {
      selectedDuration = parseInt(val);
      document.getElementById('idx-duration-badge').innerText = val + ' seconds';
      document.querySelectorAll('.idx-dur-btn').forEach(btn => {
        if (btn.innerText.trim() === val + 's') {
          btn.classList.add('active', 'bg-sky-600', 'text-white', 'border-sky-600', 'shadow-sm');
          btn.classList.remove('border-slate-200', 'text-slate-700');
        } else {
          btn.classList.remove('active', 'bg-sky-600', 'text-white', 'border-sky-600', 'shadow-sm');
          btn.classList.add('border-slate-200', 'text-slate-700');
        }
      });
    }`;

html = html.replace(scriptTarget, scriptReplacement);

// 3. Update payload in handleGenerateClips
html = html.replace(
  "body: JSON.stringify({ url: urlValue, num_clips: selectedNumClips, caption_position: selectedCaptionPos })",
  "body: JSON.stringify({ url: urlValue, num_clips: selectedNumClips, duration: selectedDuration, caption_position: selectedCaptionPos })"
);

html = html.replace(
  "formData.append('caption_position', selectedCaptionPos);",
  "formData.append('caption_position', selectedCaptionPos);\n          formData.append('duration', selectedDuration);"
);

// 4. Update max-w-2xl on video-input-container to max-w-4xl for comfortable 3-column layout
html = html.replace('max-w-2xl mx-auto', 'max-w-4xl mx-auto');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully added Clip Time Duration controls to pre-clip options on index.html!');
