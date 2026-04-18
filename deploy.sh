#!/bin/bash
set -e

# Load .dev.vars and push each value as a Cloudflare secret, then deploy

if [ ! -f .dev.vars ]; then
  echo "Error: .dev.vars not found. Fill in your values first."
  exit 1
fi

echo "Setting Cloudflare secrets from .dev.vars..."

while IFS='=' read -r key value; do
  # Skip empty lines and comments
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  # Skip lines with empty values
  [[ -z "$value" ]] && echo "  Skipping $key (empty)" && continue

  echo "  Setting $key..."
  echo "$value" | npx wrangler secret put "$key"
done < .dev.vars

echo ""
echo "Deploying worker..."
npx wrangler deploy

echo ""
echo "Done! Now register your Telegram webhook (replace YOUR_SUBDOMAIN):"
echo ""
echo "  TOKEN=\$(grep TELEGRAM_BOT_TOKEN .dev.vars | cut -d= -f2)"
echo "  curl \"https://api.telegram.org/bot\${TOKEN}/setWebhook\" \\"
echo "    -d \"url=https://organise-agent.YOUR_SUBDOMAIN.workers.dev/webhook/f643657382be65b103dbc94e686c3ba8\""
