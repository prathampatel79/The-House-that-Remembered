@echo off
title Build Standalone Desktop Executable - The House That Remembered
cd /d "%~dp0"
echo ============================================================
echo   Building TheHouseThatRemembered.exe (Native Desktop Window)
echo ============================================================

python create_icon.py
python -m PyInstaller --noconfirm --clean --onefile --windowed --name "TheHouseThatRemembered" --icon "icon.ico" --add-data "templates;templates" --add-data "static;static" --add-data "game_data.db;." --collect-all webview --collect-all pythonnet --collect-all clr_loader --hidden-import webview --hidden-import webview.platforms.winforms --hidden-import clr --hidden-import pythonnet app.py

echo.
echo Copying to project folder and Desktop...
copy /Y "dist\TheHouseThatRemembered.exe" "TheHouseThatRemembered.exe" 2>nul
copy /Y "dist\TheHouseThatRemembered.exe" "the house that remembered.exe" 2>nul
copy /Y "dist\TheHouseThatRemembered.exe" "%USERPROFILE%\OneDrive\Desktop\TheHouseThatRemembered.exe" 2>nul
if errorlevel 1 (
    copy /Y "dist\TheHouseThatRemembered.exe" "%USERPROFILE%\Desktop\TheHouseThatRemembered.exe" 2>nul
)

echo.
echo Build complete! Executable is ready:
echo 1. Inside this folder: TheHouseThatRemembered.exe
echo 2. On your Desktop: TheHouseThatRemembered.exe
pause
