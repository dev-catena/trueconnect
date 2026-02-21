#!/bin/bash

# Script para iniciar o servidor Laravel + Reverb (WebSocket)

echo "🚀 Iniciando servidor Laravel na porta 8000..."
echo "🔌 Iniciando Reverb (WebSocket) na porta 8080..."
echo ""
echo "📡 Backend: http://0.0.0.0:8000"
echo "📡 WebSocket: ws://0.0.0.0:8080"
echo ""

cd "$(dirname "$0")"

# Verifica se a porta 8000 está em uso
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  A porta 8000 já está em uso!"
    echo "   Para parar: lsof -ti:8000 | xargs kill"
    exit 1
fi

# Verifica se a porta 8080 está em uso
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  A porta 8080 (Reverb) já está em uso!"
    echo "   Para parar: lsof -ti:8080 | xargs kill"
    exit 1
fi

# Mata Reverb ao encerrar este script (Ctrl+C)
REVERB_PID=""
cleanup() {
    if [ -n "$REVERB_PID" ]; then
        kill $REVERB_PID 2>/dev/null
        echo ""
        echo "🔌 Reverb encerrado."
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM

# Inicia Reverb em segundo plano
php artisan reverb:start --host=0.0.0.0 --port=8080 &
REVERB_PID=$!
sleep 1

# Inicia o servidor Laravel (foreground)
php artisan serve --host=0.0.0.0 --port=8000





