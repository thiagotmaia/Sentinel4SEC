#!/bin/bash
set -e

CERT_DIR="$(cd "$(dirname "$0")/.." && pwd)/certs"
mkdir -p "$CERT_DIR"

if [ -f "$CERT_DIR/key.pem" ] && [ -f "$CERT_DIR/cert.pem" ]; then
  echo "Certificado ja existe em $CERT_DIR. Nada a fazer."
  exit 0
fi

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$CERT_DIR/key.pem" \
  -out "$CERT_DIR/cert.pem" \
  -days 365 \
  -subj "/CN=localhost"

echo "Certificado autoassinado gerado em $CERT_DIR (valido por 365 dias)."
