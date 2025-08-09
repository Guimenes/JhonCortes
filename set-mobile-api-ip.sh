#!/bin/bash
# Script para detectar o IP local e atualizar a URL da API do app mobile

API_FILE="/home/guilherme/JhonCortes/JhonCortesApp/src/services/api.ts"
PORT=5000

# Detecta o IP local (IPv4, não loopback)
IP=$(hostname -I | awk '{print $1}')

if [ -z "$IP" ]; then
  echo "Não foi possível detectar o IP local."
  exit 1
fi

# Atualiza a linha da BASE_URL no arquivo
sed -i "s|const BASE_URL = 'http://.*';|const BASE_URL = 'http://$IP:$PORT/api';|" "$API_FILE"

echo "BASE_URL ajustado para http://$IP:$PORT/api em $API_FILE"
