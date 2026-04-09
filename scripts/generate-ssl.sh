#!/bin/bash
# Generate self-signed SSL certificates for local HTTPS development

CERTS_DIR="certs"

# Create certs directory if it doesn't exist
mkdir -p "$CERTS_DIR"

# Generate private key
openssl genrsa -out "$CERTS_DIR/key.pem" 2048

# Generate certificate
openssl req -new -x509 -key "$CERTS_DIR/key.pem" -out "$CERTS_DIR/cert.pem" -days 365 \
  -subj "/C=NL/ST=State/L=City/O=HTPC/CN=localhost"

echo "SSL certificates generated in $CERTS_DIR/"
echo "  - $CERTS_DIR/key.pem"
echo "  - $CERTS_DIR/cert.pem"