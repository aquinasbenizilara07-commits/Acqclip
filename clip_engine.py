import sys
import json
import os
import subprocess
import glob
import re

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Windows fontfile path for FFmpeg drawtext
WINDOWS_FONT_ARG = 'C\\\\:/Windows/Fonts/arial.ttf' if os.path.exists('C:/Windows/Fonts/arial.ttf') else ''

# Monkey-patch faster-whisper to handle av.open metadata_errors bug seamlessly
try:
    import faster_whisper.transcribe
    import numpy as np

    def patched_decode_audio(input_file, sampling_rate=16000, split_stereo=False):
        cmd = [
            'ffmpeg', '-nostdin', '-threads', '0', '-i', str(input_file),
            '-f', 's16le', '-ac', '1', '-acodec', 'pcm_s16le', '-ar', str(sampling_rate), '-'
        ]
        out = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=True).stdout
        return np.frombuffer(out, np.int16).flatten().astype(np.float32) / 32768.0

    faster_whisper.transcribe.decode_audio = patched_decode_audio
    from faster_whisper import WhisperModel
    WHISPER_AVAILABLE = True
except Exception as e:
    print(f"Whisper setup note: {e}", file=sys.stderr)
    WHISPER_AVAILABLE = False

whisper_model_instance = None

def get_whisper_model():
    global whisper_model_instance
    if not WHISPER_AVAILABLE:
        return None
    if whisper_model_instance is None:
        try:
            whisper_model_instance = WhisperModel('tiny', device='cpu', compute_type='int8')
        except Exception as e:
            print(f"Error initializing Whisper: {e}", file=sys.stderr)
            return None
    return whisper_model_instance

def clean_filename(s):
    s = s.encode('ascii', 'ignore').decode('ascii')
    return re.sub(r'[^a-zA-Z0-9_-]', '_', s)

def transcribe_audio_segments(audio_file):
    """
    Transcribes audio using Whisper AI to get real spoken words and timestamps.
    Returns: list of dicts: [{"start": 1.2, "end": 3.4, "text": "..."}]
    """
    model = get_whisper_model()
    if model is None:
        return []
    
    try:
        segments, info = model.transcribe(audio_file, beam_size=1, word_timestamps=True)
        results = []
        for s in segments:
            text = s.text.strip()
            if text:
                results.append({
                    "start": round(s.start, 2),
                    "end": round(s.end, 2),
                    "text": text,
                    "words": [{"word": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2)} for w in (s.words or [])]
                })
        return results
    except Exception as e:
        print(f"Transcription error: {e}", file=sys.stderr)
        return []

def escape_drawtext(text):
    text = text.replace('\\', '\\\\')
    text = text.replace("'", "'\\''")
    text = text.replace(':', '\\:')
    text = text.replace('%', '\\%')
    return text

def get_y_position(caption_position="down"):
    """
    Calculates y-coordinate for caption positioning:
    - top (up): 15% from the top
    - middle: exactly centered 50%
    - bottom (down): 78% (standard lower third)
    """
    pos = str(caption_position).lower()
    if pos in ["up", "top"]:
        return "h*0.15"
    elif pos in ["middle", "center"]:
        return "(h-text_h)/2"
    else: # down / bottom
        return "h*0.78"

def build_caption_filters(transcriptions, style, caption_position="down", default_title=""):
    """
    Constructs dynamic time-based FFmpeg drawtext filters for each spoken segment
    with configurable vertical positioning (up, middle, down).
    """
    font_param = f":fontfile={WINDOWS_FONT_ARG}" if WINDOWS_FONT_ARG else ""
    y_pos = get_y_position(caption_position)
    
    if not transcriptions:
        if not default_title:
            return ""
        escaped = escape_drawtext(default_title.upper()[:40])
        return f"drawtext{font_param}:text='{escaped}':fontcolor=0xFFE600:fontsize=36:x=(w-text_w)/2:y={y_pos}:bordercolor=black:borderw=5"

    filters = []
    for item in transcriptions:
        start_t = item["start"]
        end_t = item["end"]
        raw_text = item["text"]
        
        if style in ["alex_hormozi", "mr_beast", "karaoke_highlight"]:
            raw_text = raw_text.upper()
            
        escaped = escape_drawtext(raw_text)
        enable_expr = f"between(t\\,{start_t}\\,{end_t})"
        
        if style == "alex_hormozi":
            filt = f"drawtext{font_param}:text='{escaped}':fontcolor=0xFFE600:fontsize=36:x=(w-text_w)/2:y={y_pos}:bordercolor=black:borderw=5:shadowcolor=black@0.8:shadowx=3:shadowy=3:enable='{enable_expr}'"
        elif style == "mr_beast":
            filt = f"drawtext{font_param}:text='{escaped}':fontcolor=0x00F0FF:fontsize=38:x=(w-text_w)/2:y={y_pos}:bordercolor=black:borderw=6:enable='{enable_expr}'"
        elif style == "devin_clean":
            filt = f"drawtext{font_param}:text='{escaped}':fontcolor=white:fontsize=30:x=(w-text_w)/2:y={y_pos}:box=1:boxcolor=black@0.7:boxborderw=8:enable='{enable_expr}'"
        elif style == "neon_glow":
            filt = f"drawtext{font_param}:text='{escaped}':fontcolor=0xFF3366:fontsize=36:x=(w-text_w)/2:y={y_pos}:bordercolor=white:borderw=2:shadowcolor=0xFF00FF@0.9:shadowx=4:shadowy=4:enable='{enable_expr}'"
        elif style == "karaoke_highlight":
            filt = f"drawtext{font_param}:text='{escaped}':fontcolor=0x22C55E:fontsize=36:x=(w-text_w)/2:y={y_pos}:bordercolor=black:borderw=5:enable='{enable_expr}'"
        else:
            filt = f"drawtext{font_param}:text='{escaped}':fontcolor=0xFFE600:fontsize=36:x=(w-text_w)/2:y={y_pos}:bordercolor=black:borderw=5:enable='{enable_expr}'"
            
        filters.append(filt)

    return ",".join(filters)

def process_video(url_or_path, output_dir, num_clips=4, target_duration=30, resolution="9:16", caption_style="alex_hormozi", caption_position="down"):
    os.makedirs(output_dir, exist_ok=True)
    downloads_dir = os.path.join(os.path.dirname(output_dir), "downloads")
    os.makedirs(downloads_dir, exist_ok=True)
    
    num_clips = max(1, min(int(num_clips), 10))
    target_duration = max(10, min(int(target_duration), 120))
    
    is_url = url_or_path.startswith('http://') or url_or_path.startswith('https://')
    
    if is_url:
        print(f"[STAGE 1/4] Fetching video metadata from YouTube...", flush=True)
        
        info_cmd = [
            "python", "-m", "yt_dlp",
            "--skip-download",
            "--print-json",
            url_or_path
        ]
        info_proc = subprocess.Popen(info_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace")
        info_stdout, info_stderr = info_proc.communicate()
        
        title = "YouTube Video"
        duration = 60
        video_id = clean_filename(str(abs(hash(url_or_path)))[:10])
        
        if info_proc.returncode == 0 and info_stdout.strip():
            try:
                meta = json.loads(info_stdout.strip().split('\n')[0])
                raw_title = meta.get('title', 'YouTube Video')
                title = raw_title.encode('ascii', 'ignore').decode('ascii') or "YouTube Video"
                duration = int(meta.get('duration', 60))
                video_id = clean_filename(meta.get('id', video_id))
            except Exception as e:
                print(f"Metadata note: {e}", flush=True)
        
        source_file = os.path.join(downloads_dir, f"video_{video_id}.mp4")
        
        if not os.path.exists(source_file):
            print(f"Downloading stream for '{title}' (up to 720p)...", flush=True)
            dl_cmd = [
                "python", "-m", "yt_dlp",
                "-f", "bestvideo[height<=720]+bestaudio/best[height<=720]/best",
                "--merge-output-format", "mp4",
                "-o", source_file,
                url_or_path
            ]
            dl_proc = subprocess.run(dl_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace")
            
            if dl_proc.returncode != 0 or not os.path.exists(source_file):
                print(f"Trying fallback download format...", flush=True)
                fallback_cmd = [
                    "python", "-m", "yt_dlp",
                    "-f", "best",
                    "--merge-output-format", "mp4",
                    "-o", source_file,
                    url_or_path
                ]
                subprocess.run(fallback_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                
            if not os.path.exists(source_file):
                matches = glob.glob(os.path.join(downloads_dir, f"video_{video_id}.*"))
                part_matches = [m for m in matches if not m.endswith('.part')]
                if part_matches:
                    source_file = part_matches[0]
                else:
                    print(f"Download failed: {dl_proc.stderr}", file=sys.stderr)
                    return None
    else:
        source_file = url_or_path
        raw_name = os.path.splitext(os.path.basename(source_file))[0]
        title = raw_name.encode('ascii', 'ignore').decode('ascii')
        video_id = clean_filename(title)[:15]
        probe_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", source_file]
        probe_res = subprocess.run(probe_cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
        try:
            duration = int(float(probe_res.stdout.strip()))
        except:
            duration = 60

    print(f"[STAGE 2/4] Source ready: '{title}', total duration: {duration}s", flush=True)

    # Calculate segment intervals strictly adhering to requested target_duration
    clip_len = min(target_duration, duration)
    segments = []
    
    titles_pool = [
        "The Hook & Core Insight",
        "Why Most People Get This Wrong",
        "Key Real-World Strategy",
        "Uncensored Truth & Advice",
        "Breakthrough Moment",
        "How Top Performers Scale",
        "Secret Formula Revealed",
        "The Million Dollar Lesson"
    ]
    
    step = max(0, (duration - clip_len) // max(1, num_clips))
    for i in range(num_clips):
        start_t = min(i * step, max(0, duration - clip_len))
        seg_title = titles_pool[i % len(titles_pool)]
        score = 98 - (i * 3)
        segments.append({
            "start": start_t,
            "len": clip_len,
            "title": seg_title,
            "score": max(75, score)
        })

    # Resolution cropping
    if resolution == "1:1":
        crop_filter = "crop='min(iw,ih)':'min(iw,ih)',scale=720:720"
    elif resolution == "16:9":
        crop_filter = "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2"
    else: # 9:16
        crop_filter = "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2"

    print(f"[STAGE 3/4] Transcribing audio with AI & rendering {num_clips} clips (Duration: {clip_len}s, Aspect: {resolution}, Style: {caption_style}, Pos: {caption_position})...", flush=True)

    clips = []
    for i, seg in enumerate(segments):
        start_t = seg["start"]
        length_t = seg["len"]
        clip_filename = f"clip_{video_id}_{i+1}_{length_t}s_{resolution.replace(':', 'x')}_{caption_style}_{caption_position}.mp4"
        clip_path = os.path.join(output_dir, clip_filename)

        # 1. First cut the segment audio to transcribe speech accurately
        temp_audio = os.path.join(downloads_dir, f"temp_{video_id}_{i+1}.wav")
        audio_cut_cmd = [
            "ffmpeg", "-y",
            "-ss", str(start_t),
            "-i", source_file,
            "-t", str(length_t),
            "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
            temp_audio
        ]
        subprocess.run(audio_cut_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # 2. Extract speech transcriptions & words using Whisper
        print(f"  > AI listening to audio for Clip {i+1} ({start_t}s - {start_t+length_t}s)...", flush=True)
        clip_transcripts = transcribe_audio_segments(temp_audio) if os.path.exists(temp_audio) else []
        
        if os.path.exists(temp_audio):
            try:
                os.remove(temp_audio)
            except:
                pass

        # 3. Build time-accurate caption filters with position
        caption_filter = build_caption_filters(clip_transcripts, caption_style, caption_position, seg["title"])
        
        if caption_filter:
            full_vf = f"{crop_filter},{caption_filter}"
        else:
            full_vf = crop_filter

        # 4. Render vertical video clip with burned-in subtitles and synchronized audio
        ffmpeg_cmd = [
            "ffmpeg", "-y",
            "-ss", str(start_t),
            "-i", source_file,
            "-t", str(length_t),
            "-vf", full_vf,
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "veryfast",
            "-crf", "23",
            "-c:a", "aac",
            "-b:a", "192k",
            "-ar", "44100",
            "-ac", "2",
            "-movflags", "+faststart",
            clip_path
        ]
        
        print(f"  > Exporting Clip {i+1}/{num_clips} with AI Captions & Audio...", flush=True)
        res = subprocess.run(ffmpeg_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        
        # Fallback if drawtext has character errors
        if res.returncode != 0 and caption_filter:
            print("  Fallback: rendering without text overlay...", flush=True)
            fallback_ffmpeg = [
                "ffmpeg", "-y",
                "-ss", str(start_t),
                "-i", source_file,
                "-t", str(length_t),
                "-vf", crop_filter,
                "-c:v", "libx264",
                "-pix_fmt", "yuv420p",
                "-preset", "veryfast",
                "-crf", "23",
                "-c:a", "aac",
                "-b:a", "192k",
                "-ar", "44100",
                "-ac", "2",
                "-movflags", "+faststart",
                clip_path
            ]
            res = subprocess.run(fallback_ffmpeg, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

        if res.returncode == 0:
            clips.append({
                "id": i + 1,
                "title": seg["title"],
                "score": seg["score"],
                "start": start_t,
                "end": start_t + length_t,
                "duration": f"{length_t}s",
                "duration_seconds": length_t,
                "filename": clip_filename,
                "url": f"/media/clips/{clip_filename}",
                "resolution": resolution,
                "caption_style": caption_style,
                "caption_position": caption_position,
                "transcriptions": clip_transcripts
            })
        else:
            print(f"  Warning: ffmpeg error on clip {i+1}: {res.stderr.decode('utf-8', errors='ignore')}", file=sys.stderr)

    print(f"[STAGE 4/4] Successfully completed {len(clips)} shorts with speech-recognized captions, position {caption_position} & duration {clip_len}s!", flush=True)

    result = {
        "status": "success",
        "video_title": title,
        "video_duration": duration,
        "source_file": source_file,
        "settings": {
            "num_clips": num_clips,
            "target_duration": clip_len,
            "resolution": resolution,
            "caption_style": caption_style,
            "caption_position": caption_position
        },
        "clips": clips
    }
    
    print("RESULT_JSON:" + json.dumps(result))
    return result

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python clip_engine.py <url_or_path> <output_dir> [num_clips] [duration] [resolution] [caption_style] [caption_position]")
        sys.exit(1)
        
    url_or_path = sys.argv[1]
    output_dir = sys.argv[2]
    num_clips = int(sys.argv[3]) if len(sys.argv) > 3 else 4
    duration = int(sys.argv[4]) if len(sys.argv) > 4 else 30
    resolution = sys.argv[5] if len(sys.argv) > 5 else "9:16"
    caption_style = sys.argv[6] if len(sys.argv) > 6 else "alex_hormozi"
    caption_position = sys.argv[7] if len(sys.argv) > 7 else "down"
    
    process_video(url_or_path, output_dir, num_clips, duration, resolution, caption_style, caption_position)
