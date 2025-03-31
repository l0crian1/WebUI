@echo off
echo Stopping VyOS WebUI components...

REM Find and kill Python process running the backend
for /f "tokens=2" %%i in ('tasklist ^| findstr "python"') do (
    taskkill /PID %%i /F
)

REM Find and kill Node.js processes for the frontend
for /f "tokens=2" %%i in ('tasklist ^| findstr "node"') do (
    taskkill /PID %%i /F
)

echo VyOS WebUI components have been stopped.
pause 