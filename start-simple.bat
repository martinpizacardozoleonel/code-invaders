@echo off
echo === CODE INVADERS - Inicio Simple (sin Node) ===
where python >nul 2>&1
if %errorlevel%==0 (
  echo Python encontrado - iniciando servidor estatico en puerto 8000...
  echo Abre http://localhost:8000 en tu navegador
  echo (Modo offline: login/ranking guardado en el navegador)
  cd /d "%~dp0public"
  python -m http.server 8000
  pause
  exit /b
)
where py >nul 2>&1
if %errorlevel%==0 (
  echo Python (py) encontrado...
  cd /d "%~dp0public"
  py -m http.server 8000
  pause
  exit /b
)
echo No se encontro Python. Probando con Node...
where node >nul 2>&1
if %errorlevel%==0 (
  cd /d "%~dp0"
  node server.js
  pause
  exit /b
)
echo.
echo No se encontro Python ni Node.
echo Instala Python desde https://python.org o Node desde https://nodejs.org
echo O instala la extension "Live Server" en VS Code y abre public/index.html con "Open with Live Server"
pause
