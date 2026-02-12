#!/bin/bash

# Script para matar processos do Metro Bundler na porta 8081

echo "🔍 Procurando processos na porta 8081..."

# Encontra processos na porta 8081
PIDS=$(lsof -ti:8081 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "✅ Nenhum processo encontrado na porta 8081"
    exit 0
fi

echo "📋 Processos encontrados:"
lsof -i :8081 2>/dev/null

echo ""
echo "🛑 Matando processos..."
for PID in $PIDS; do
    echo "   Matando processo $PID..."
    kill -9 $PID 2>/dev/null
done

sleep 1

# Verifica se ainda há processos
REMAINING=$(lsof -ti:8081 2>/dev/null)
if [ -z "$REMAINING" ]; then
    echo "✅ Porta 8081 liberada!"
else
    echo "⚠️  Ainda há processos na porta 8081. Tente novamente."
fi





