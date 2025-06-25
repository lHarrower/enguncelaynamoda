#-- Protocol: English-First (File Content, Comments) --#

#!/bin/bash

# This script will exit immediately if any command fails.
set -e

echo "🚀 Starting deployment process for 'ai-analysis' function..."

# Step 1: Securely set the secrets from the local .env file to the Supabase project.
echo "🔐 Setting secrets from .env file..."
supabase secrets set --env-file .env

# Step 2: Deploy the 'ai-analysis' function to the Supabase cloud.
# The --no-verify-jwt flag allows invoking the function for testing without a user's JWT.
echo "☁️ Deploying 'ai-analysis' function to Supabase..."
supabase functions deploy ai-analysis --no-verify-jwt

echo "✅ SUCCESS! The 'ai-analysis' function has been deployed."
echo "➡️ You can now check its status in your Supabase project dashboard under Edge Functions."