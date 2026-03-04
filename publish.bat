@echo off
setlocal
cd /d "%~dp0"

echo.
echo ==============================
echo   Blog Publish (One Click)
echo ==============================
echo.
set /p MSG=Commit message (Enter = auto timestamp): 

if "%MSG%"=="" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\publish.ps1"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\publish.ps1" -Message "%MSG%"
)

echo.
if errorlevel 1 (
  echo Publish failed. Check the logs above.
) else (
  echo Publish finished.
)
pause
endlocal
