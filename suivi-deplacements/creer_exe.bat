@echo off
chcp 65001 >nul
REM Optionnel : fabrique SuiviDeplacements.exe (dossier dist) pour ne plus dependre de Python.
python -m pip install --upgrade pyinstaller
python -m PyInstaller --onefile --noconsole --name SuiviDeplacements "%~dp0suivi_deplacements.pyw"
echo.
echo Termine : lance dist\SuiviDeplacements.exe une fois, il s'inscrira au demarrage.
pause
