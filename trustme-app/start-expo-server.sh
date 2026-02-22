#!/bin/bash
# Script para subir o Expo no servidor (usado pelo trustme-expo.service)
# Carrega nvm se existir, depois inicia o Expo em modo LAN

cd "$(dirname "$0")"

# Carregar nvm se existir
if [ -f /home/darley/.nvm/nvm.sh ]; then
  source /home/darley/.nvm/nvm.sh
fi

export CI=1
export EXPO_NO_TELEMETRY=1

exec npx expo start --clear --lan
