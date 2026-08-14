FROM python:3.10-slim

WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose default port
EXPOSE 8000

# Start server using the PORT environment variable if set, otherwise default to 8000
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
