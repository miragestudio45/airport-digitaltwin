@echo off
setlocal
cd /d "%~dp0"
title Build Gia Binh Smart Airport
if not exist "node_modules" call npm.cmd install
call npm.cmd run build
if errorlevel 1 (
  echo Build that bai.
) else (
  echo Build thanh cong. File nam trong thu muc dist.
)
pause
