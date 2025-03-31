@echo off
echo === VyOS WebUI Startup Script ===
echo This script will set up and run the VyOS WebUI application
echo.

REM Check for Python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed or not in PATH. Please install Python 3.
    exit /b 1
)

REM Check for Node.js and npm
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH. Please install Node.js.
    exit /b 1
)

npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed or not in PATH. Please install npm.
    exit /b 1
)

echo All required dependencies are installed.
echo.

REM Set up the backend
echo Setting up the backend...
cd backend || (echo Error: backend directory not found && exit /b 1)

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Start backend in a new window
echo Starting the backend server...
start "VyOS WebUI Backend" cmd /c "python main.py"

cd ..

REM Set up the frontend
echo Setting up the frontend...
cd frontend || (echo Error: frontend directory not found && exit /b 1)

REM Install dependencies
echo Installing Node.js dependencies...
call npm install

REM Start frontend in a new window
echo Starting the frontend development server...
start "VyOS WebUI Frontend" cmd /c "npm run dev"

cd ..

REM Print success message
echo.
echo === VyOS WebUI is now running! ===
echo Backend URL: http://localhost:8000
echo Frontend URL: http://localhost:3000
echo.
echo Note: To stop the servers, close the terminal windows or use Task Manager.

pause 