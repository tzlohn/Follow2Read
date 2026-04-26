FROM python:3.11-slim

# 安裝 system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    && rm -rf /var/lib/apt/lists/*

# install python deps
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# install playwright browser
RUN python -m playwright install chromium

# copy app
COPY . .

# run
CMD ["gunicorn", "-b", "0.0.0.0:10000", "app:app"]