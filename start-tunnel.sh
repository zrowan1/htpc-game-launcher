#!/bin/bash
# HTPC Game Launcher - Dev Tunnel
# Met ngrok voor externe toegang

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           HTPC Game Launcher - Dev Tunnel                    ║"
echo "║           Met ngrok voor externe toegang                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "[ERROR] ngrok is niet geïnstalleerd!"
    echo ""
    echo "Installeer ngrok eerst:"
    echo "  1. Ga naar https://ngrok.com/download"
    echo "  2. Download en installeer ngrok"
    echo "  3. Registreer een account en voer uit:"
    echo "     ngrok config add-authtoken JOUW_TOKEN"
    echo ""
    exit 1
fi

# Check if certs exist
if [ ! -f "certs/cert.pem" ]; then
    echo "[INFO] SSL certificaten niet gevonden. Genereren..."
    npm run certs
    if [ $? -ne 0 ]; then
        echo "[ERROR] Certificaat generatie mislukt!"
        exit 1
    fi
fi

echo "[1/3] Start Vite dev server op https://localhost:5173..."
echo ""

# Start Vite in background
nohup npm run dev:web:https > vite.log 2>&1 &
VITE_PID=$!
echo "   ✓ Vite gestart (PID: $VITE_PID)"

sleep 5

echo "[2/3] Start ngrok tunnel..."
echo ""
nohup ngrok http https://localhost:5173 --host-header=rewrite > ngrok.log 2>&1 &
NGROK_PID=$!
echo "   ✓ Ngrok gestart (PID: $NGROK_PID)"

echo ""
echo "[3/3] Wachten tot ngrok klaar is..."

# Wait for ngrok to be ready (max 30 seconds)
NGROK_URL=""
COUNTER=0
while [ $COUNTER -lt 30 ] && [ -z "$NGROK_URL" ]; do
    sleep 1
    # Try to get the ngrok URL from API
    if command -v curl &> /dev/null; then
        NGROK_DATA=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null || echo "")
        if [ ! -z "$NGROK_DATA" ]; then
            # Extract URL using grep/sed
            NGROK_URL=$(echo "$NGROK_DATA" | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)
        fi
    fi
    COUNTER=$((COUNTER + 1))
    echo -n "."
done

echo ""
echo ""

if [ -z "$NGROK_URL" ]; then
    echo "[WARN] Kon ngrok URL niet automatisch ophalen binnen 30 seconden"
    echo ""
fi

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                      KLAAR!                                  ║"
echo "║                                                              ║"
echo "║  Open een van deze URLs in je browser:                       ║"
echo "║                                                              ║"

if [ ! -z "$NGROK_URL" ]; then
    echo "║  Publieke URL: $NGROK_URL"
    echo "║                                                              ║"
fi

echo "║  Lokaal:      https://localhost:5173                         ║"
echo "║  Ngrok UI:    http://localhost:4040                          ║"
echo "║                                                              ║"

if [ -z "$NGROK_URL" ]; then
    echo "║  [TIP] Open http://localhost:4040 in je browser              ║"
    echo "║        voor de 'Forwarding' URL als deze leeg blijft         ║"
    echo "║                                                              ║"
fi

echo "║  Logs:        vite.log en ngrok.log                          ║"
echo "║  Stoppen:     kill $VITE_PID $NGROK_PID                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ ! -z "$NGROK_URL" ]; then
    echo "Kopieer deze URL: $NGROK_URL"
    echo ""
fi

echo "Druk op Ctrl+C om te stoppen..."
echo ""
wait