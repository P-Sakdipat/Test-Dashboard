@echo off
echo Starting React Frontend (Vercel/Sheety Version)...
echo Pointing to Google Drive data via Sheety API.
echo Opening browser in a few seconds...

start cmd /k "cd frontend_vercel && npm run dev"

timeout /t 5 /nobreak > nul
start http://localhost:9090
