#!/bin/bash
# Instala e ativa os serviços systemd no servidor 10.102.0.30
# para que a plataforma e o app subam automaticamente no boot.
# Executar localmente: ./setup-services-on-server.sh

set -e
SERVER="10.102.0.30"
USER="darley"
PASS="yhvh77"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

run_ssh() {
  sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} "$@"
}

run_scp() {
  sshpass -p "$PASS" scp -o StrictHostKeyChecking=no "$1" ${USER}@${SERVER}:"$2"
}

echo "=== 1. Enviando arquivos de serviço ==="
run_scp "$SCRIPT_DIR/systemd/trustme-reverb.service" "/tmp/trustme-reverb.service"
run_scp "$SCRIPT_DIR/systemd/trustme-expo.service" "/tmp/trustme-expo.service"
run_scp "$SCRIPT_DIR/trustme-app/start-expo-server.sh" "/tmp/start-expo-server.sh"

echo ""
echo "=== 2. Instalando serviços no servidor ==="
run_ssh "echo '$PASS' | sudo -S cp /tmp/trustme-reverb.service /tmp/trustme-expo.service /etc/systemd/system/ && \
  mkdir -p /home/darley/trueconnect/trustme-app && cp /tmp/start-expo-server.sh /home/darley/trueconnect/trustme-app/ && chmod +x /home/darley/trueconnect/trustme-app/start-expo-server.sh && \
  echo '$PASS' | sudo -S systemctl daemon-reload && \
  echo 'Serviços instalados.'"

echo ""
echo "=== 3. Habilitando início automático (boot) ==="
run_ssh "echo '$PASS' | sudo -S systemctl enable trustme-reverb trustme-expo
for svc in nginx php8.3-fpm php8.2-fpm mysql mariadb; do
  echo '$PASS' | sudo -S systemctl enable \$svc 2>/dev/null && echo \"  habilitado: \$svc\" || true
done
echo 'Serviços habilitados para boot.'"

echo ""
echo "=== 4. Iniciando Reverb e Expo ==="
run_ssh "echo '$PASS' | sudo -S systemctl restart trustme-reverb 2>&1
echo '$PASS' | sudo -S systemctl restart trustme-expo 2>/dev/null || echo 'Expo: verifique se trustme-app e node estão no servidor'
sleep 2
echo '$PASS' | sudo -S systemctl status trustme-reverb --no-pager 2>&1 | head -8"

echo ""
echo "=== 5. Garantindo nginx e php-fpm em execução ==="
run_ssh "echo '$PASS' | sudo -S systemctl start nginx 2>/dev/null; \
  echo '$PASS' | sudo -S systemctl start php8.3-fpm 2>/dev/null || \
  echo '$PASS' | sudo -S systemctl start php8.2-fpm 2>/dev/null || \
  echo '$PASS' | sudo -S systemctl start php-fpm 2>/dev/null; \
  echo 'OK.'"

echo ""
echo "=== Concluído ==="
echo "Serviços configurados para iniciar no boot:"
echo ""
echo "  Backend Laravel   → nginx + php-fpm (API em /api)"
echo "  Frontend Vue      → nginx (plataforma web em /)"
echo "  Reverb            → trustme-reverb (WebSocket :8080)"
echo "  Expo (app)        → trustme-expo (Metro :8081)"
echo "  Banco             → mysql"
echo ""
echo "Plataforma: http://$SERVER/"
echo "App: escaneie o QR do Expo em http://$SERVER:8081 ou conecte manualmente"
echo ""
echo "Reinicie o servidor para validar: sudo reboot"
