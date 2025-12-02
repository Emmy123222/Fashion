# 🚀 Groq AI Setup Guide

## Step 1: Get Groq API Key

1. Go to https://console.groq.com
2. Sign up or log in
3. Navigate to API Keys
4. Click "Create API Key"
5. Copy the key (starts with `gsk_`)

## Step 2: Add API Key to Environment

### Local Development (.env file):

```bash
# Add to FashionMatchGame/.env
GROQ_API_KEY=gsk_your_api_key_here
```

### Supabase (for Edge Functions):

1. Go to your Supabase Dashboard
2. Navigate to: Project Settings → Edge Functions
3. Click "Add Secret"
4. Name: `GROQ_API_KEY`
5. Value: Your Groq API key
6. Click "Save"

## Step 3: Install Supabase CLI

```bash
# Install globally
npm install -g supabase

# Or use npx
npx supabase --version
```

## Step 4: Link Your Supabase Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Find your project ref in Supabase Dashboard → Project Settings → General
```

## Step 5: Deploy Edge Functions

```bash
# Deploy difficulty adapter
supabase functions deploy groq-difficulty

# Deploy image generator
supabase functions deploy groq-generate-images

# Or deploy both at once
supabase functions deploy
```

## Step 6: Test the Functions

### Test Difficulty Adapter:

```bash
curl -X POST \
  'https://your-project-ref.supabase.co/functions/v1/groq-difficulty' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "player_id": "test-123",
    "player_type": "adult",
    "round_number": 1,
    "performance": {
      "accuracy": 0.85,
      "avg_match_time": 3.2,
      "mistakes": 4,
      "combo_max": 5,
      "time_taken": 180,
      "time_limit": 300
    },
    "current_difficulty": {
      "level": 2,
      "grid_size": { "rows": 4, "cols": 4 },
      "time_limit": 270,
      "items_count": 8
    }
  }'
```

### Test Image Generator:

```bash
curl -X POST \
  'https://your-project-ref.supabase.co/functions/v1/groq-generate-images' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "category": "shoes",
    "player_type": "adult",
    "count": 5,
    "description": "Various sneaker styles"
  }'
```

## Step 7: Verify in App

1. Start your app: `npm start`
2. Play a game
3. Check console logs for:
   - `🤖 Calling Groq AI for difficulty adaptation...`
   - `✅ AI Response: {...}`
   - `🎯 Next Level: X`

## Troubleshooting

### Error: "GROQ_API_KEY not found"
- Make sure you added the secret in Supabase Dashboard
- Redeploy the functions after adding the secret

### Error: "Failed to fetch"
- Check your Supabase URL in `.env`
- Verify anon key is correct
- Check Edge Functions are deployed

### Error: "Groq API error: 401"
- Your API key is invalid or expired
- Get a new key from Groq Console

### Functions not deploying?
- Make sure you're linked to the correct project
- Check you have permissions
- Try: `supabase functions deploy --debug`

## Monitoring

### View Function Logs:

```bash
# Real-time logs
supabase functions logs groq-difficulty --tail

# Or in Supabase Dashboard
# Go to: Edge Functions → Select function → Logs
```

### Check Function Status:

```bash
supabase functions list
```

## Cost Management

### Groq Pricing:
- Mixtral-8x7b: ~$0.27 per 1M tokens
- Very affordable compared to OpenAI

### Estimated Usage:
- Difficulty check: ~500 tokens = $0.000135
- Image generation: ~1000 tokens = $0.00027
- 1000 games/day ≈ $0.40/day ≈ $12/month

### Monitor Usage:
- Check Groq Console → Usage
- Set up billing alerts
- Monitor in Supabase Edge Function logs

## Next Steps

Once deployed:

1. ✅ Test with real gameplay
2. ✅ Monitor AI responses
3. ✅ Adjust prompts if needed
4. ✅ Generate initial fashion items
5. ✅ Enable for all players

## Quick Commands Reference

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy groq-difficulty

# View logs
supabase functions logs groq-difficulty --tail

# List functions
supabase functions list

# Delete function
supabase functions delete groq-difficulty
```

## Support

- Groq Docs: https://console.groq.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Issues: Check console logs and function logs

Your AI is now ready to make the game smarter! 🤖🎮
