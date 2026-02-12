#!/bin/bash

# Script para remover pastas antigas do projeto
# Execute com: bash remove_old_folders.sh

echo "Removendo pastas antigas..."

# Remover trustme-backend
if [ -d "trustme-backend" ]; then
    echo "Removendo trustme-backend..."
    sudo rm -rf trustme-backend
    if [ $? -eq 0 ]; then
        echo "✓ trustme-backend removida com sucesso"
    else
        echo "✗ Erro ao remover trustme-backend"
    fi
else
    echo "trustme-backend não encontrada"
fi

# Remover truste-me
if [ -d "truste-me" ]; then
    echo "Removendo truste-me..."
    sudo rm -rf truste-me
    if [ $? -eq 0 ]; then
        echo "✓ truste-me removida com sucesso"
    else
        echo "✗ Erro ao remover truste-me"
    fi
else
    echo "truste-me não encontrada"
fi

echo ""
echo "Pastas restantes:"
ls -d */




