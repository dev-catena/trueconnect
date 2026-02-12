#!/bin/bash

# Script para iniciar o servidor Laravel na porta 8001

echo "🚀 Iniciando servidor Laravel na porta 8001..."
echo "📡 Backend estará disponível em: http://localhost:8001"
echo ""

cd "$(dirname "$0")"

# Verifica se a porta 8001 está em uso
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  A porta 8001 já está em uso!"
    echo "   Para parar o processo, execute: lsof -ti:8001 | xargs kill"
    exit 1
fi

# Inicia o servidor
php artisan serve --host=0.0.0.0 --port=8001





