const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Update renderClipsResult call and add automatic redirection to /editor.html
const target = "if (data.status === 'completed') {";
const replacement = `if (data.status === 'completed') {
            clearInterval(activePollInterval);
            localStorage.setItem('last_klap_job_id', jobId);
            renderClipsResult(data, jobId);
            resetSubmitBtn();
            // Automatically open video editor page
            setTimeout(() => {
              window.location.href = '/editor.html?job_id=' + jobId;
            }, 1200);
            return;`;

if (html.includes("renderClipsResult(data);")) {
  html = html.replace("renderClipsResult(data);", "renderClipsResult(data, jobId); localStorage.setItem('last_klap_job_id', jobId); setTimeout(() => { window.location.href = '/editor.html?job_id=' + jobId; }, 1200);");
}

// Add an "Open Editor" button to the results panel header
if (html.includes("Total Duration: ${jobData.video_duration}s")) {
  html = html.replace(
    "Total Duration: ${jobData.video_duration}s • AI Reframed to 9:16 Vertical HD • Ready to Post",
    "Total Duration: ${jobData.video_duration}s • Opening Video Editor... <a href='/editor.html?job_id=' + (jobData.job_id || '') class='ml-2 inline-flex items-center gap-1 px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold'>Open Editor &rarr;</a>"
  );
}

// Add an "Edit in Studio" button to each card
if (html.includes("Download Clip\n          </a>")) {
  html = html.replace(
    "Download Clip\n          </a>",
    "Download Clip\n          </a>\n          <a href='/editor.html' class='mt-1.5 w-full py-1 text-[11px] font-semibold bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1 no-underline'>Edit in Studio &rarr;</a>"
  );
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated successfully with editor redirection');
