#!/bin/bash

# VyOS WebUI Startup Script
# This script sets up and runs both the backend and frontend components

# Print colorized output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== VyOS WebUI Startup Script ===${NC}"
echo -e "${BLUE}This script will set up and run the VyOS WebUI application${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"

# Check for Python
if ! command_exists python3 && ! command_exists python; then
    echo -e "${RED}Error: Python is not installed. Please install Python 3.${NC}"
    exit 1
fi

# Determine which Python command to use
PYTHON_CMD="python3"
if ! command_exists python3; then
    PYTHON_CMD="python"
fi

# Check for Node.js and npm
if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed. Please install npm.${NC}"
    exit 1
fi

echo -e "${GREEN}All required dependencies are installed.${NC}"
echo ""

# Check if we're on Windows or Unix
IS_WINDOWS=false
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    IS_WINDOWS=true
fi

# Set up the backend
echo -e "${YELLOW}Setting up the backend...${NC}"
cd backend || { echo -e "${RED}Error: backend directory not found${NC}"; exit 1; }

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
if [ "$IS_WINDOWS" = true ]; then
    echo "Activating virtual environment (Windows)..."
    . venv/Scripts/activate
else
    echo "Activating virtual environment (Unix)..."
    . venv/bin/activate
fi

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Start backend in the background
echo "Starting the backend server..."
if [ "$IS_WINDOWS" = true ]; then
    start "VyOS WebUI Backend" cmd /c "$PYTHON_CMD main.py"
else
    $PYTHON_CMD main.py > backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend running with PID: $BACKEND_PID"
fi

cd ..

# Set up the frontend
echo -e "${YELLOW}Setting up the frontend...${NC}"
cd frontend || { echo -e "${RED}Error: frontend directory not found${NC}"; exit 1; }

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Start frontend in the background
echo "Starting the frontend development server..."
if [ "$IS_WINDOWS" = true ]; then
    start "VyOS WebUI Frontend" cmd /c "npm run dev"
else
    npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend running with PID: $FRONTEND_PID"
fi

cd ..

# Print success message
echo ""
echo -e "${GREEN}=== VyOS WebUI is now running! ===${NC}"
echo -e "${GREEN}Backend URL: http://localhost:8000${NC}"
echo -e "${GREEN}Frontend URL: http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Note: To stop the servers, you may need to terminate the processes manually.${NC}"
if [ "$IS_WINDOWS" = false ]; then
    echo -e "${YELLOW}Backend PID: $BACKEND_PID${NC}"
    echo -e "${YELLOW}Frontend PID: $FRONTEND_PID${NC}"
fi

# If not on Windows, create a stop script
if [ "$IS_WINDOWS" = false ]; then
    echo "#!/bin/bash" > stop.sh
    echo "echo 'Stopping VyOS WebUI components...'" >> stop.sh
    echo "kill $BACKEND_PID" >> stop.sh
    echo "kill $FRONTEND_PID" >> stop.sh
    echo "echo 'Stopped VyOS WebUI components'" >> stop.sh
    chmod +x stop.sh
    echo -e "${YELLOW}A stop.sh script has been created to stop the servers.${NC}"
fi

exit 0 