# VyOS WebUI

A modern web interface for the VyOS routing platform, built with React and FastAPI.

## Project Structure

- **backend/**: Python FastAPI backend
- **frontend/**: React frontend with Material UI

## Quick Start

### Automated Setup (Recommended)

#### Windows
Simply run the `start.bat` file by double-clicking it or running it from the command prompt:
```
start.bat
```

To stop the application, run:
```
stop.bat
```

#### Linux/macOS
Run the shell script:
```
./start.sh
```

This script will:
1. Check for required dependencies
2. Set up the Python virtual environment
3. Install all backend dependencies
4. Start the backend server
5. Install all frontend dependencies
6. Start the frontend development server

On Linux/macOS, a `stop.sh` script will be automatically created to help you stop the servers.

### Manual Setup

If you prefer to set up the application manually, follow these steps:

#### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Set up a Python virtual environment:
   ```
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```
   python main.py
   ```
   The server will be available at http://localhost:8000

#### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   The frontend will be available at http://localhost:3000

## Requirements

- Python 3.7 or higher
- Node.js 14.0 or higher
- npm 6.0 or higher 