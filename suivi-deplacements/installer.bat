@echo off
chcp 65001 >nul
REM Lance l'application et l'inscrit au demarrage de Windows.
set "PYW=pythonw"
where pythonw >nul 2>nul
if errorlevel 1 set "PYW=pyw"
where %PYW% >nul 2>nul
if errorlevel 1 (
  echo Python n'est pas installe. Installe-le depuis https://www.python.org/downloads/
  echo en cochant "Add python.exe to PATH", puis relance ce fichier.
  pause
  exit /b 1
)
start "" %PYW% "%~dp0suivi_deplacements.pyw"
echo C'est installe : la fenetre va s'ouvrir et se lancera a chaque demarrage du PC.
timeout /t 4 >nul
