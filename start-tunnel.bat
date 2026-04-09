@echo off
chcp 65001 >nul
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           HTPC Game Launcher - Dev Tunnel                    ║
echo ║           Met ngrok voor externe toegang                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] ngrok is niet geïnstalleerd!
    echo.
    echo Installeer ngrok eerst:
    echo   1. Ga naar https://ngrok.com/download
    echo   2. Download en installeer ngrok
    echo   3. Registreer een account en voer uit:
    echo      ngrok config add-authtoken JOUW_TOKEN
    echo.
    pause
    exit /b 1
)

REM Check if certs exist
if not exist "certs\cert.pem" (
    echo [INFO] SSL certificaten niet gevonden. Genereren...
    call npm run certs
    if %errorlevel% neq 0 (
        echo [ERROR] Certificaat generatie mislukt!
        pause
        exit /b 1
    )
)

echo [1/3] Start Vite dev server op https://localhost:5173...
echo.
start "Vite Dev Server" cmd /k "npm run dev:web:https"

REM Wait a bit for Vite to start
timeout /t 5 /nobreak >nul

echo.
echo [2/3] Start ngrok tunnel...
echo.
start "ngrok Tunnel" cmd /k "ngrok http https://localhost:5173 --host-header=rewrite"

echo.
echo [3/3] Wachten tot ngrok klaar is...

REM Wait for ngrok to be ready (max 30 seconds)
set NGROK_URL=
set /a COUNTER=0
:WAIT_LOOP
ping -n 2 127.0.0.1 >nul
curl -s http://localhost:4040/api/tunnels 2>nul > %TEMP%\ngrok_tunnels.json
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('powershell -Command "Get-Content %TEMP%\ngrok_tunnels.json | ConvertFrom-Json | Select-Object -ExpandProperty tunnels | Select-Object -First 1 | Select-Object -ExpandProperty public_url" 2^>nul') do (
        if not "%%a"=="" (
            set NGROK_URL=%%a
            goto :FOUND_URL
        )
    )
)

set /a COUNTER+=1
if %COUNTER% lss 30 goto :WAIT_LOOP

echo.
echo [WARN] Kon ngrok URL niet automatisch ophalen binnen 30 seconden
echo.
goto :SHOW_MANUAL

:FOUND_URL
echo.
echo    ✓ URL gevonden!
echo.

:SHOW_MANUAL
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                      KLAAR!                                  ║
echo ║                                                              ║
echo ║  Open een van deze URLs in je browser:                       ║
echo ║                                                              ║

if not "%NGROK_URL%"=="" (
    echo ║  Publieke URL: %NGROK_URL%
    echo ║                                                              ║
)

echo ║  Lokaal:      https://localhost:5173                         ║
echo ║  Ngrok UI:    http://localhost:4040                          ║
echo ║                                                              ║

if "%NGROK_URL%"=="" (
    echo ║  [TIP] Kijk in het 'ngrok Tunnel' venster voor de            ║
    echo ║        'Forwarding' URL als deze leeg blijft                 ║
    echo ║                                                              ║
)

echo ║  Stoppen:     Sluit de vensters 'Vite Dev Server'            ║
echo ║               en 'ngrok Tunnel'                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

if not "%NGROK_URL%"=="" (
    echo Kopieer deze URL: %NGROK_URL%
    echo.
)

echo Druk op een toets om dit venster te sluiten...
echo (De servers blijven draaien in hun eigen vensters)
pause >nul

REM Cleanup
if exist "%TEMP%\ngrok_tunnels.json" del "%TEMP%\ngrok_tunnels.json"
