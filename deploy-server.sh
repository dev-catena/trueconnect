#!/bin/bash
# Deploy script para servidor 10.102.0.30
# Executar localmente (onde há acesso ao servidor): ./deploy-server.sh

set -e
SERVER="10.102.0.30"
USER="darley"
PASS="yhvh77"
PROJECT_DIR="/home/darley/trueconnect"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

run_ssh() {
  sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} "$@"
}

run_scp() {
  sshpass -p "$PASS" scp -o StrictHostKeyChecking=no "$1" ${USER}@${SERVER}:"$2"
}

echo "=== 1. Conectando e atualizando código ==="
run_ssh "cd $PROJECT_DIR && git pull origin main 2>&1 || true"
run_ssh "cd $PROJECT_DIR && pwd && ls -la trusteme-front trustme-back 2>/dev/null || ls -la"

echo ""
echo "=== 2. Testando backend ==="
run_ssh "cd $PROJECT_DIR/trustme-back && php artisan route:list --path=api 2>&1 | head -25"
run_ssh "cd $PROJECT_DIR/trustme-back && php artisan migrate:status 2>&1"

echo ""
echo "=== 3. Buildando frontend localmente e enviando para o servidor ==="
cd "$SCRIPT_DIR/trusteme-front" && npm ci 2>&1 && npm run build 2>&1
run_ssh "mkdir -p $PROJECT_DIR/trusteme-front/dist"
sshpass -p "$PASS" scp -o StrictHostKeyChecking=no -r "$SCRIPT_DIR/trusteme-front/dist"/* ${USER}@${SERVER}:$PROJECT_DIR/trusteme-front/dist/
run_ssh "ls -la $PROJECT_DIR/trusteme-front/dist/ 2>&1"

echo ""
echo "=== 4. Instalando nginx + PHP-FPM, parando Apache e configurando ==="
run_ssh "echo '$PASS' | sudo -S apt-get update -qq && echo '$PASS' | sudo -S apt-get install -y nginx php8.3-fpm 2>/dev/null || echo '$PASS' | sudo -S apt-get install -y nginx php-fpm 2>/dev/null || true"
run_ssh "echo '$PASS' | sudo -S systemctl stop apache2 2>/dev/null; echo '$PASS' | sudo -S systemctl disable apache2 2>/dev/null; echo '$PASS' | sudo -S systemctl enable php8.3-fpm 2>/dev/null; echo '$PASS' | sudo -S systemctl start php8.3-fpm 2>/dev/null; true"
run_scp "$SCRIPT_DIR/nginx-trustme.conf" "/tmp/trustme.conf"
run_ssh "PHPFPM=\$(ls /var/run/php/php*-fpm.sock 2>/dev/null | head -1) && if [ -n \"\$PHPFPM\" ]; then sed -i \"s|unix:/var/run/php/php8.2-fpm.sock|unix:\$PHPFPM|\" /tmp/trustme.conf; fi"
run_ssh "echo '$PASS' | sudo -S mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled"
run_ssh "echo '$PASS' | sudo -S cp /tmp/trustme.conf /etc/nginx/sites-available/trustme"
run_ssh "echo '$PASS' | sudo -S ln -sf /etc/nginx/sites-available/trustme /etc/nginx/sites-enabled/trustme"
run_ssh "echo '$PASS' | sudo -S rm -f /etc/nginx/sites-enabled/default"
run_ssh "echo '$PASS' | sudo -S chmod o+x /home/darley /home/darley/trueconnect /home/darley/trueconnect/trusteme-front /home/darley/trueconnect/trusteme-front/dist /home/darley/trueconnect/trustme-back /home/darley/trueconnect/trustme-back/public 2>/dev/null; echo '$PASS' | sudo -S chmod -R o+rX $PROJECT_DIR/trusteme-front/dist $PROJECT_DIR/trustme-back 2>/dev/null"
run_ssh "echo '$PASS' | sudo -S systemctl stop apache2 2>/dev/null; echo '$PASS' | sudo -S nginx -t 2>&1 && echo '$PASS' | sudo -S systemctl enable nginx && echo '$PASS' | sudo -S systemctl restart nginx 2>&1"

echo ""
echo "=== 5. Storage link (Laravel) ==="
run_ssh "cd $PROJECT_DIR/trustme-back && php artisan storage:link 2>&1 || true"

echo ""
echo "=== Deploy concluído ==="
echo "Acesse: http://$SERVER/"
echo "Backend API: http://$SERVER/api/"
