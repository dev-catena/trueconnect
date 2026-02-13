#!/bin/bash

# Script para iniciar o Laravel Reverb (WebSocket)
# Deve rodar em paralelo ao php artisan serve

echo "🔌 Iniciando Laravel Reverb na porta 8080..."
echo "📡 WebSocket estará disponível em: ws://0.0.0.0:8080"
echo ""

cd "$(dirname "$0")"

php artisan reverb:start --host=0.0.0.0 --port=8080
