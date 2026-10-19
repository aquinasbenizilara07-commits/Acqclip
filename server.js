const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Static directories
app.use(express.static(__dirname));
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Multer storage for uploaded video files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'media', 'downloads');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'upload_' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// Active jobs state
const jobs = new Map();

// Endpoint: Generate / Re-generate Clips with Customizable Parameters
app.post('/api/generate-clips', upload.single('video_file'), async (req, res) => {
  const videoUrl = req.body.url;
  const videoFile = req.file ? req.file.path : null;
  const sourcePath = req.body.source_path || null;

  const target = sourcePath || videoFile || videoUrl;

  if (!target) {
    return res.status(400).json({ error: 'Please provide either a video URL or a video file.' });
  }

  const numClips = req.body.num_clips || '4';
  const duration = req.body.duration || '30';
  const resolution = req.body.resolution || '9:16';
  const captionStyle = req.body.caption_style || 'alex_hormozi';
  const captionPosition = req.body.caption_position || 'down'; // up, middle, down

  const jobId = 'job_' + Date.now();
  const clipsDir = path.join(__dirname, 'media', 'clips');
  fs.mkdirSync(clipsDir, { recursive: true });

  console.log(`[Job ${jobId}] Starting clip generation for:`, target, {
    numClips, duration, resolution, captionStyle, captionPosition
  });

  jobs.set(jobId, {
    status: 'processing',
    progress: 'Starting fetch and analysis...',
    target,
    settings: { numClips, duration, resolution, captionStyle, captionPosition },
    clips: []
  });

  // Launch python clip_engine with new parameters including captionPosition
  const pyProcess = spawn('python', [
    'clip_engine.py',
    target,
    clipsDir,
    numClips.toString(),
    duration.toString(),
    resolution.toString(),
    captionStyle.toString(),
    captionPosition.toString()
  ]);

  let outputBuffer = '';

  pyProcess.stdout.on('data', (data) => {
    const text = data.toString();
    console.log(`[Job ${jobId} stdout]:`, text.trim());
    outputBuffer += text;

    // Detect stage updates
    if (text.includes('[STAGE 1/4]')) {
      jobs.get(jobId).progress = 'Fetching video & downloading stream...';
    } else if (text.includes('[STAGE 2/4]')) {
      jobs.get(jobId).progress = 'Analyzing audio & speech recognition...';
    } else if (text.includes('[STAGE 3/4]')) {
      jobs.get(jobId).progress = `Rendering ${numClips} clips (${captionPosition} captions, ${duration}s duration)...`;
    } else if (text.includes('[STAGE 4/4]')) {
      jobs.get(jobId).progress = 'Finalizing clips and virality scores...';
    }
  });

  pyProcess.stderr.on('data', (data) => {
    console.error(`[Job ${jobId} stderr]:`, data.toString().trim());
  });

  pyProcess.on('close', (code) => {
    console.log(`[Job ${jobId}] Python process exited with code ${code}`);
    if (code === 0) {
      const match = outputBuffer.match(/RESULT_JSON:(.+)/);
      if (match) {
        try {
          const result = JSON.parse(match[1]);
          jobs.set(jobId, {
            status: 'completed',
            progress: 'Complete!',
            video_title: result.video_title,
            video_duration: result.video_duration,
            source_file: result.source_file || target,
            settings: result.settings,
            clips: result.clips
          });
          return;
        } catch (e) {
          console.error('Failed to parse result JSON:', e);
        }
      }
    }

    jobs.set(jobId, {
      status: 'failed',
      progress: 'Failed to process video. Please check URL or file format.'
    });
  });

  // Respond immediately with jobId for live progress polling
  res.json({
    job_id: jobId,
    status: 'processing'
  });
});

// Endpoint: Check Job Status
app.get('/api/job-status/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// Endpoint: Get specific clip details for the editor
app.get('/api/editor-data/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

app.listen(PORT, () => {
  console.log(`Klap AI Engine server running on http://localhost:${PORT}`);
});
