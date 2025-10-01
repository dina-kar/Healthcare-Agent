#!/bin/bash
# Healthcare Agent Runner Script

cd /home/dina/Videos/Healthcare-Agent/agents

# Kill any existing agent processes
echo "Stopping any running agent processes..."
pkill -9 -f "python.*agent.py"
sleep 1

# Check if port is free
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Port 8000 is still in use. Force killing processes..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start the agent
echo "Starting Healthcare Agent..."
echo "Press Ctrl+C to stop the agent"
echo "======================================"
uv run python agent.py
