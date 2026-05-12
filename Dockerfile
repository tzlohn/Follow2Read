FROM python:3.11-slim

WORKDIR /app

# system deps for playwright
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \\
    ffmpeg \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# install playwright browsers
RUN playwright install chromium

COPY . .

# Render requires $PORT
CMD ["sh", "-c", "gunicorn app:app --bind 0.0.0.0:$PORT"]

