# Final Deployment Plan

## Overview
Complete roadmap from current state to Cuptoopia demo and Google Play release.

---

## Phase 1: Free vs Paid Feature Definition ✅

### FREE Version (Demo for Cuptoopia):
**Available Features:**
- ✅ Store Mode only (organized grid layout)
- ✅ Level 1-3 (Easy, Medium, Hard)
- ✅ Single category: Shoes only
- ✅ Basic leaderboard (Global only)
- ✅ 5 games per day limit
- ✅ Profile with basic stats
- ✅ Sign up with 3 fields

**Locked Features (Show "Premium" badge):**
- 🔒 Pile Mode
- 🔒 Levels 4-11+ (Very Hard to IMPOSSIBLE)
- 🔒 All other categories (8 categories locked)
- 🔒 Mixed "All Categories" mode
- 🔒 Full leaderboard (12 scopes)
- 🔒 Unlimited games
- 🔒 Rewards & Collection system
- 🔒 Multiplayer mode
- 🔒 Team mode

### PAID Version ($4.99/year):
**Unlocked Features:**
- ✅ Both Store & Pile modes
- ✅ All 11+ difficulty levels
- ✅ All 9 categories + Mixed mode
- ✅ Full leaderboard (12 scopes, 4 time periods)
- ✅ Unlimited games
- ✅ Rewards & Collection system
- ✅ Multiplayer mode
- ✅ Team mode
- ✅ Ad-free experience
- ✅ Priority support

---

## Phase 2: Feature Locking Implementation

### Step 1: Create Feature Gate Service

**File:** `src/services/featureGate.service.ts`

```typescript
export const featureGate = {
  // Check if user can access feature
  canAccessFeature(feature: string, isPremium: boolean): boolean
  
  // Get daily game count
  getDailyGameCount(userId: string): Promise<number>
  
  // Check if can play game
  canPlayGame(userId: string, isPremium: boolean): Promise<boolean>
  
  // Show upgrade prompt
  showUpgradePrompt(feature: string): void
}
```

### Step 2: Add Feature Locks to UI

**Locations to update:**
1. **CategorySelectionScreen** - Lock 8 categories
2. **LevelSelectionScreen** - Lock levels 4-11+
3. **GameModeScreen** - Lock Pile mode
4. **LeaderboardScreen** - Lock 11 scopes
5. **CollectionScreen** - Lock entire screen
6. **MultiplayerLobbyScreen** - Lock entire screen

### Step 3: Add Premium Badges

**Component:** `src/components/common/PremiumBadge.tsx`
- Shows "🔒 Premium" on locked features
- Tapping opens upgrade screen

---

## Phase 3: Database Connection & Sync

### Step 1: Run All Migrations

```sql
-- In order:
1. sql/05_add_profile_fields.sql
2. sql/06_add_detailed_organization_fields.sql
3. sql/07_enforce_unique_usernames.sql
4. sql/08_fix_leaderboard_aggregation.sql
5. sql/09_reward_system.sql
6. sql/11_update_category_constraint.sql (or 11b)
7. sql/10_seed_fashion_images.sql
8. sql/12_stripe_subscription_tables.sql
```

### Step 2: Deploy Supabase Edge Functions

```bash
# Deploy Stripe functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook

# Deploy AI functions (optional)
supabase functions deploy groq-difficulty
supabase functions deploy groq-generate-images
```

### Step 3: Configure Environment Variables

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Stripe (website only)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Groq AI (optional)
EXPO_PUBLIC_GROQ_API_KEY=
```

---

## Phase 4: Store Mode Polish (Demo Ready)

### Requirements:
- ✅ Clean grid layout (4x4 for Level 1)
- ✅ Smooth card flips
- ✅ Clear match feedback
- ✅ Timer display
- ✅ Score display
- ✅ Transparent backgrounds
- ✅ Shoes category only
- ✅ Levels 1-3 accessible

### Testing Checklist:
- [ ] Cards display properly
- [ ] Matching works correctly
- [ ] Timer counts down
- [ ] Score calculates correctly
- [ ] Game ends properly
- [ ] Results screen shows
- [ ] Can replay
- [ ] Performance is smooth

---

## Phase 5: Rewards System (Paid Only)

### Implementation:
1. **Already created:** `sql/09_reward_system.sql`
2. **Already integrated:** `SinglePlayerGameScreen.tsx`
3. **Already created:** `CollectionScreen.tsx`

### Lock for Free Users:
- Show "🔒 Premium Feature" on Collection tab
- Disable reward processing for free users
- Show upgrade prompt when tapping Collection

---

## Phase 6: Multiplayer Mode (Paid Only)

### Current Status:
- ✅ Database tables exist
- ✅ Service methods exist
- ✅ Lobby screen exists
- ✅ Game screen exists

### Finalization Needed:
1. **Real-time sync** - Use Supabase Realtime
2. **Matchmaking** - Find opponents
3. **Turn management** - Handle turns
4. **Winner determination** - Calculate winner
5. **Lock for free users** - Show premium badge

### Quick Implementation:
```typescript
// Use Supabase Realtime for live updates
const channel = supabase.channel('match:' + matchId)
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'match_participants' 
  }, handleUpdate)
  .subscribe()
```

---

## Phase 7: Team Mode (Paid Only)

### Current Status:
- ✅ Database tables exist
- ✅ Service methods exist
- ⚠️ UI screens need creation

### Implementation:
1. **TeamCreationScreen** - Create/join teams
2. **TeamDashboardScreen** - View team stats
3. **TeamGameScreen** - Play as team
4. **Lock for free users** - Show premium badge

---

## Phase 8: Cuptoopia Demo Preparation

### Demo Version Features:
- ✅ Store Mode only
- ✅ Shoes category only
- ✅ Levels 1-3
- ✅ 5 games per day
- ✅ Basic leaderboard
- ✅ Clean UI
- ✅ Smooth performance

### Demo Package:
1. **Build web version** for Cuptoopia website
2. **Create demo video** showing gameplay
3. **Write description** highlighting features
4. **Add screenshots** of key screens
5. **Include upgrade CTA** to full version

### Build Commands:
```bash
# Web build for Cuptoopia
npm run build:web

# Test locally
npm run web
```

---

## Phase 9: Google Play Preparation

### Requirements:
1. **App Bundle** - Build signed AAB
2. **Store Listing** - Screenshots, description, icon
3. **Privacy Policy** - Required by Google
4. **Content Rating** - ESRB rating
5. **In-App Purchases** - NOT using (website only)

### Build Process:
```bash
# Build Android bundle
eas build --platform android --profile production

# Test on device
eas build --platform android --profile preview
```

### Store Listing:
- **Title:** Fashion Match Game
- **Short Description:** Match fashion items in this fun memory game
- **Full Description:** [Detailed description]
- **Category:** Puzzle
- **Content Rating:** Everyone
- **Price:** Free (with $4.99/year subscription on website)

---

## Implementation Timeline

### Week 1: Feature Locking
- [ ] Day 1-2: Create featureGate service
- [ ] Day 3-4: Add locks to all screens
- [ ] Day 5: Add premium badges
- [ ] Day 6-7: Testing & polish

### Week 2: Database & Stripe
- [ ] Day 1: Run all migrations
- [ ] Day 2: Deploy Edge Functions
- [ ] Day 3: Configure Stripe
- [ ] Day 4: Test payment flow
- [ ] Day 5-7: Bug fixes & testing

### Week 3: Store Mode Polish
- [ ] Day 1-3: Polish UI/UX
- [ ] Day 4-5: Performance optimization
- [ ] Day 6-7: Testing on devices

### Week 4: Multiplayer & Team
- [ ] Day 1-3: Implement multiplayer
- [ ] Day 4-5: Implement team mode
- [ ] Day 6-7: Testing & polish

### Week 5: Cuptoopia Demo
- [ ] Day 1-2: Build demo version
- [ ] Day 3: Create demo video
- [ ] Day 4: Write descriptions
- [ ] Day 5: Upload to Cuptoopia
- [ ] Day 6-7: Gather feedback

### Week 6: Google Play
- [ ] Day 1-2: Build production APK
- [ ] Day 3: Create store listing
- [ ] Day 4: Submit for review
- [ ] Day 5-7: Address review feedback

---

## Testing Checklist

### Free Version:
- [ ] Can play Store Mode
- [ ] Can access Shoes category
- [ ] Can play Levels 1-3
- [ ] Limited to 5 games/day
- [ ] Locked features show premium badge
- [ ] Upgrade prompt works
- [ ] Basic leaderboard works

### Paid Version:
- [ ] All modes accessible
- [ ] All categories accessible
- [ ] All levels accessible
- [ ] Unlimited games
- [ ] Rewards system works
- [ ] Collection tracks progress
- [ ] Multiplayer works
- [ ] Team mode works
- [ ] Full leaderboard works

### Payment Flow:
- [ ] Checkout session creates
- [ ] Payment processes
- [ ] Webhook fires
- [ ] Database updates
- [ ] Status syncs to app
- [ ] Features unlock immediately

---

## Success Metrics

### Demo (Cuptoopia):
- 100+ downloads
- 4+ star rating
- 10+ conversions to paid

### Production (Google Play):
- 1,000+ downloads in first month
- 5% conversion rate to paid
- 4.5+ star rating
- <1% crash rate

---

## Next Immediate Steps

1. **Create featureGate.service.ts**
2. **Add premium badges to locked features**
3. **Test free version flow**
4. **Polish Store Mode**
5. **Run database migrations**
6. **Deploy Stripe functions**
7. **Test payment flow**
8. **Build Cuptoopia demo**

---

## Files to Create

### Services:
- [ ] `src/services/featureGate.service.ts`
- [ ] `src/services/gameLimit.service.ts`

### Components:
- [ ] `src/components/common/PremiumBadge.tsx`
- [ ] `src/components/common/UpgradePrompt.tsx`
- [ ] `src/components/common/FeatureLock.tsx`

### Screens:
- [ ] `src/screens/team/TeamCreationScreen.tsx`
- [ ] `src/screens/team/TeamDashboardScreen.tsx`
- [ ] `src/screens/team/TeamGameScreen.tsx`

### Documentation:
- [ ] `CUPTOOPIA_DEMO_GUIDE.md`
- [ ] `GOOGLE_PLAY_SUBMISSION.md`
- [ ] `PRIVACY_POLICY.md`
- [ ] `TERMS_OF_SERVICE.md`

---

**Ready to finalize and deploy!** 🚀

Let me know which phase you want to tackle first, and I'll implement it completely.
