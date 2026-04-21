@echo off
echo Starting Django Backend...
start cmd /k "cd backend && ..\venv\Scripts\python.exe manage.py runserver"

echo Starting React Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting. Opening browser in a few seconds...
timeout /t 5 /nobreak > nul
start http://localhost:8989
