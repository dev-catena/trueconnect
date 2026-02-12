#!/bin/bash

# Script para iniciar Expo com Node.js 20

echo "🔍 Verificando versão do Node.js..."

# Tentar carregar nvm se existir
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar se Node 20 está disponível
if command -v nvm &> /dev/null; then
    echo "📦 Usando nvm para ativar Node.js 20..."
    nvm use 20 2>/dev/null || nvm use 20.20.0 2>/dev/null || echo "⚠️  Node 20 não encontrado no nvm"
fi

# Verificar versão atual
NODE_VERSION=$(node --version)
echo "✅ Node.js versão: $NODE_VERSION"

# Verificar se é Node 20+
if [[ ! "$NODE_VERSION" =~ ^v2[0-9] ]]; then
    echo "⚠️  AVISO: Node.js 20+ é recomendado para Expo SDK 54"
    echo "   Versão atual: $NODE_VERSION"
    echo ""
    echo "💡 Para usar Node.js 20:"
    echo "   1. Se tiver nvm: nvm use 20"
    echo "   2. Ou atualize o PATH para apontar para Node.js 20"
    echo ""
    read -p "Continuar mesmo assim? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Navegar para o diretório do projeto
cd "$(dirname "$0")"

# Iniciar Expo
echo "🚀 Iniciando Expo..."
npx expo start --port 8083 "$@"





