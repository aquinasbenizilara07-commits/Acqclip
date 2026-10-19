# ── Base: Debian Bookworm slim with Node.js 20 ──────────────────────────────
FROM node:20-bookworm-slim

# Install system dependencies: Python, FFmpeg, pip
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Make python3 available as 'python'
RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Install Python dependencies first (layer cache)
COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Install Node dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Create media directories (ephemeral on free tier)
RUN mkdir -p media/clips media/downloads

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
