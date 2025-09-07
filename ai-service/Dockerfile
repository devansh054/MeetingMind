FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model (with error handling)
RUN python -m spacy download en_core_web_sm || echo "spaCy model download failed, will download at runtime"

# Copy source code
COPY . .

# Create non-root user
RUN useradd -m -u 1001 aiuser
RUN chown -R aiuser:aiuser /app
USER aiuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
