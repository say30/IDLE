@echo off
REM Retire l'application du demarrage de Windows (tes deplacements sont conserves).
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v SuiviDeplacements /f
taskkill /im SuiviDeplacements.exe /f >nul 2>nul
echo Retire du demarrage. Tes donnees restent dans %%APPDATA%%\SuiviDeplacements
pause
