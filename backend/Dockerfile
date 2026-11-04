
# 1. Select Python base image
FROM python:3.12-slim

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy dependency file
COPY requirements.txt .

# 4. Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy application source files
COPY . .

# 6. Document application port
EXPOSE 8000

# 7. Start FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
