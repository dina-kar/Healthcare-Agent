#!/bin/bash
# Healthcare Agent Stopper Script

echo "Stopping Healthcare Agent..."

# Method 1: Kill by process name
pkill -9 -f "python.*agent.py"

# Method 2: Kill by port
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Killing processes on port 8000..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
fi

# Method 3: Kill all uv run processes
pkill -9 -f "uv run"

sleep 1

# Verify
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Warning: Port 8000 is still in use"
    lsof -i:8000
else
    echo "✅ Agent stopped successfully. Port 8000 is free."
fi
