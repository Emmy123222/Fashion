# Fashion Match Game - Setup Guide

## Prerequisites

- Node.js 18+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- Supabase account (free tier works)
- Android Studio (for Android development) or Xcode (for iOS)

## Step 1: Install Dependencies

```bash
cd FashionMatchGame
npm install
```

## Step 2: Supabase Setup

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready

### 2.2 Run SQL Scripts
In your Supabase project dashboard, go to SQL Editor and run these scripts in order:

1. **Run `sql/01_tables.sql`** - Creates all database tables
2. **Run `sql/02_functions.sql`** - Creates functions and triggers
3. **Run `sql/04_rls_policies.sql`** - Sets up Row Level Security
4. **Run `sql/03_seed_data.sql`** - Adds initial game configs and sample items

### 2.3 Create Storage Bucket
1. Go to Storage in Supabase dashboard
2. Create a new bucket named `fashion-items`
3. Make it public
4. Set up storage policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fashion-items');

-- Allow public to view
CREATE POLICY "Public can view"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fashion-items');
```

### 2.4 Enable Authentication
1. Go to Authentication > Providers
2. Enable Email provider
3. (Optional) Enable Google OAuth

## Step 3: Environment Variables

Your `.env` file is already configured with Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://nsngqsvbibopftabvrfh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Add Placeholder Assets

Create these placeholder image files in `assets/`:

```bash
mkdir -p assets
# You'll need to add these images:
# - card-back.png (back of card design)
# - check-icon.png (checkmark for matched cards)
# - logo.png (app logo)
# - icon.png (app icon)
# - splash.png (splash screen)
# - onboarding1.png, onboarding2.png, onboarding3.png
```

For now, you can use placeholder images or download free assets from:
- [Unsplash](https://unsplash.com)
- [Flaticon](https://flaticon.com)
- [Freepik](https://freepik.com)

## Step 5: Run the App

### Start Development Server
```bash
npm start
```

### Run on Android
```bash
npm run android
```

### Run on iOS (Mac only)
```bash
npm run ios
```

### Run on Web
```bash
npm run web
```

## Step 6: Create Admin User

After signing up with your admin email:

```sql
-- In Supabase SQL Editor
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'your-admin@email.com';
```

## Testing the Game

### Test Single Player Flow
1. Open the app
2. Complete onboarding
3. Sign up / Log in
4. Tap "Play" button
5. Select "Single Player"
6. Play the game!

### Test Features
- ✅ User registration
- ✅ Login
- ✅ Single player game
- ✅ Score tracking
- ✅ Timer countdown
- ✅ Match detection
- ✅ Game completion
- ✅ Results screen

## Common Issues

### Issue: "Missing Supabase environment variables"
**Solution**: Make sure `.env` file exists and contains valid Supabase credentials

### Issue: "Failed to load fashion items"
**Solution**: Run the seed data SQL script (`03_seed_data.sql`)

### Issue: Images not loading
**Solution**: 
1. Check that placeholder URLs in seed data are accessible
2. Or replace with real image URLs
3. Or use local assets

### Issue: "Auth check failed"
**Solution**: 
1. Verify Supabase URL and anon key are correct
2. Check that RLS policies are set up correctly
3. Make sure auth is enabled in Supabase

## Next Steps

### 1. Replace Placeholder Images
Replace the placeholder fashion item images with real AI-generated images:
- Use Replicate API with Stable Diffusion
- Use Stability AI
- Use DALL-E (OpenAI)

### 2. Implement Multiplayer
- Complete MultiplayerLobbyScreen
- Complete MultiplayerGameScreen
- Test real-time synchronization

### 3. Add Stripe Payments
- Set up Stripe account
- Add Stripe publishable key to `.env`
- Implement subscription flow

### 4. Build Admin Dashboard
- Create admin screens
- Add analytics
- Implement content moderation

### 5. Add Audio
- Add background music
- Add sound effects
- Implement audio controls

## Development Tips

### Hot Reload
The app supports hot reload. Just save your files and changes will appear instantly.

### Debugging
- Use React Native Debugger
- Check Expo logs in terminal
- Use `console.log()` for debugging
- Check Supabase logs for database issues

### Testing on Real Device
1. Install Expo Go app on your phone
2. Scan QR code from terminal
3. App will load on your device

## Production Deployment

### Android
```bash
# Build APK
eas build --platform android --profile production

# Or build AAB for Play Store
eas build --platform android --profile production --type app-bundle
```

### iOS
```bash
# Build for App Store
eas build --platform ios --profile production
```

## Support

For issues or questions:
1. Check Supabase documentation
2. Check Expo documentation
3. Review error logs
4. Check the PROGRESS.md file for known issues

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)
