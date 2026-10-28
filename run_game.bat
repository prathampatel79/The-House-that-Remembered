@echo off
title The House That Remembered - Offline 3D Mystery Thriller
cd /d "%~dp0"
echo ============================================================
echo   THE HOUSE THAT REMEMBERED
echo   Offline First-Person 3D Mystery Thriller
echo   College Exhibition Demonstration
echo ============================================================
echo Starting local Flask server...
echo Game will automatically open in your default browser.
echo If it does not, navigate to: http://127.0.0.1:5000
echo.
timeout /t 2 /nobreak >nul
start http://127.0.0.1:5000
python app.py
pause
