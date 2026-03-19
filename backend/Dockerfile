FROM python:3.9-slim

WORKDIR /app

# Install simple requirements (Faster build for Render Free Tier)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port (Render uses PORT env var)
EXPOSE 8000

# Start the Fast API server
CMD ["python", "main.py"]
