@echo off
setlocal
cd /d "%~dp0"
title Gia Binh Smart Airport Digital Twin Platform

echo ===============================================
echo   GIA BINH SMART AIRPORT DIGITAL TWIN PLATFORM
echo ===============================================
echo.

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Khong tim thay Node.js / npm.
  echo Hay cai Node.js LTS truoc khi chay.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [1/3] Dang cai thu vien lan dau. Vui long cho...
  call npm.cmd install
  if errorlevel 1 goto :error
) else (
  echo [1/3] Thu vien da san sang.
)

echo [2/3] Dang khoi dong server tai cong 5173...
start "Gia Binh Airport Server" cmd /k "cd /d ""%~dp0"" && npm.cmd run dev -- --host 0.0.0.0 --port 5173 --strictPort"

echo [3/3] Dang mo trinh duyet...
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173/site/gia-binh"
exit /b 0

:error
echo.
echo [ERROR] Khong the cai thu vien hoac khoi dong du an.
pause
exit /b 1
