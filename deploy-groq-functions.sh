#!/bin/bash

# Groq AI Edge Functions Deployment Script

echo "🚀 Deploying Groq AI Edge Functions to Supabase..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "📦 Install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo "🔐 Run: supabase login"
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Deploy difficulty adapter
echo "📤 Deploying groq-difficulty function..."
if supabase functions deploy groq-difficulty; then
    echo "✅ groq-difficulty deployed successfully"
else
    echo "❌ Failed to deploy groq-difficulty"
    exit 1
fi

echo ""

# Deploy image generator
echo "📤 Deploying groq-generate-images function..."
if supabase functions deploy groq-generate-images; then
    echo "✅ groq-generate-images deployed successfully"
else
    echo "❌ Failed to deploy groq-generate-images"
    exit 1
fi

echo ""
echo "🎉 All functions deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Add GROQ_API_KEY secret in Supabase Dashboard"
echo "2. Test functions with: ./test-groq-functions.sh"
echo "3. Check logs with: supabase functions logs groq-difficulty --tail"
echo ""
