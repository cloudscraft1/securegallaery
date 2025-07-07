@echo off
echo =======================================
echo    SECURE GALLERY - LOCAL DEVELOPMENT
echo =======================================
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && echo Starting VaultSecure Backend... && uvicorn server:app --host 127.0.0.1 --port 8000 --reload"
echo.
echo Waiting 8 seconds for backend to initialize...
timeout /t 8 /nobreak > nul
echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && echo Starting VaultSecure Frontend... && set BROWSER=none && set NODE_OPTIONS=--max-old-space-size=4096 && npm start"
echo.
echo =======================================
echo Both servers are starting!
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo Health:   http://localhost:8000/health
echo.
echo CORS and security have been configured for local development.
echo If you see network errors, wait a moment for both servers to fully start.
echo.
echo Press any key to exit...
echo =======================================
pause > nul
