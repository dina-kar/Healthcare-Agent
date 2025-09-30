# Use Alpine Python for minimal image size
FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for Python packages
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    libffi-dev \
    && rm -rf /var/cache/apk/*

# Copy dependency files first for better layer caching
COPY pyproject.toml uv.lock ./

# Install Python dependencies using uv for faster installation
RUN pip install uv && \
    uv sync --frozen

# Copy source code after dependencies (changes less frequently)
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["uv", "run", "python", "agent.py"]
