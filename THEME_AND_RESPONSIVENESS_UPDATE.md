# Theme and Responsiveness Update

## New Color Scheme

### Brand Colors
- **Primary (Royal Purple):** `#6C63FF` - Main brand color for buttons, headers, primary actions
- **Secondary (Hot Pink):** `#FF4F81` - Secondary actions, highlights, active states
- **Accent (Gold Yellow):** `#FFC736` - Highlights, achievements, #1 rank badges

### Background Colors
- **Soft White:** `#F8FAFC` - Light mode background
- **Deep Navy:** `#0F172A` - Dark mode background, overlays

### Semantic Colors
- **Success (Neon Green):** `#22C55E` - Correct matches, success states
- **Danger (Red):** `#EF4444` - Wrong matches, errors, delete actions
- **Warning:** `#FFC736` - Warnings, cautions (uses accent color)

### Mode-Specific Colors

#### Child Mode (Bright & Playful)
- Primary: `#FF6B9D` (Bright Pink)
- Secondary: `#FFD93D` (Bright Yellow)
- Accent: `#6BCF7F` (Bright Green)
- Background: `#FFF5F7` (Very Light Pink)

#### Teen Mode (Bold & Neon)
- Primary: `#FF4F81` (Hot Pink)
- Secondary: `#6C63FF` (Royal Purple)
- Accent: `#00F5FF` (Neon Cyan)
- Background: `#1A1A2E` (Dark Blue)

#### Adult Mode (Dark & Premium)
- Primary: `#6C63FF` (Royal Purple)
- Secondary: `#FF4F81` (Hot Pink)
- Accent: `#FFC736` (Gold Yellow)
- Background: `#0F172A` (Deep Navy)

## Leaderboard Responsiveness Fixes

### Mobile Optimization

#### Header
- Reduced padding for mobile screens
- Optimized title size (24px)
- Better spacing between elements

#### Period Tabs
- Smaller font size (11px) for better fit
- Reduced padding (4px horizontal)
- Minimum height of 36px
- Better text centering

#### Scope Tabs
- Horizontal scrolling for 12 scopes
- Smaller font size (12px)
- Compact padding (8px horizontal)
- Maximum height of 50px to prevent overflow

#### Leaderboard Cards
- Reduced card margins (4px)
- Smaller rank badges (44x44px instead of 48x48px)
- Smaller avatars (36x36px instead of 40x40px)
- Optimized text sizes (14px username, 18px score)
- Added `minWidth: 0` for proper text truncation
- Better spacing between elements

#### Profile Modal
- Increased max height to 85%
- Better padding (16px instead of 24px)
- Smaller avatar (72px instead of 80px)
- Optimized stat grid with proper wrapping
- Inner containers for stat boxes with background
- Smaller text sizes for better fit

### Rank Badge Colors
- **1st Place:** Gold Yellow (`#FFC736`)
- **2nd Place:** Silver (`#C0C0C0`)
- **3rd Place:** Bronze (`#CD7F32`)
- **Other Ranks:** Royal Purple (`#6C63FF`)

### Typography Adjustments
- Header title: 24px (down from 32px)
- Period tabs: 11px (down from 12px)
- Scope tabs: 12px (down from 13px)
- Username: 14px (down from 16px)
- Score: 18px (down from 20px)
- Country: 11px (down from 12px)
- Score label: 10px (down from 12px)

## Implementation Details

### Files Updated
1. **src/theme/index.ts**
   - Added new color scheme
   - Added mode-specific colors (child, teen, adult)
   - Maintained backward compatibility

2. **src/screens/LeaderboardScreen.tsx**
   - Updated all styles for mobile responsiveness
   - Fixed text truncation issues
   - Improved spacing and padding
   - Updated colors to new scheme
   - Added inner containers for stat boxes

### Key Improvements

#### Responsiveness
- All text properly truncates on small screens
- Tabs fit without wrapping
- Cards stack efficiently
- Modal adapts to screen size
- No horizontal overflow

#### Visual Hierarchy
- Clear distinction between active/inactive states
- Better color contrast
- Consistent spacing
- Professional appearance

#### Performance
- Optimized rendering
- Efficient layout calculations
- Smooth scrolling
- Fast tab switching

## Usage

### Accessing Mode Colors
```typescript
import { theme } from '../theme';

// Use mode-specific colors
const childPrimary = theme.modes.child.primary;
const teenBackground = theme.modes.teen.background;
const adultAccent = theme.modes.adult.accent;
```

### Applying Colors
```typescript
// Primary actions
backgroundColor: theme.colors.primary // Royal Purple

// Secondary actions
backgroundColor: theme.colors.secondary // Hot Pink

// Highlights/achievements
backgroundColor: theme.colors.accent // Gold Yellow

// Success states
backgroundColor: theme.colors.success // Neon Green

// Error states
backgroundColor: theme.colors.danger // Red
```

## Testing Recommendations

### Screen Sizes to Test
- iPhone SE (375x667) - Smallest modern iPhone
- iPhone 12/13/14 (390x844) - Standard iPhone
- iPhone 14 Pro Max (430x932) - Largest iPhone
- Small Android (360x640) - Common Android size
- Medium Android (412x915) - Pixel-like devices

### Test Scenarios
1. **Period Tab Switching**
   - All 4 tabs visible
   - Text doesn't wrap
   - Active state clearly visible

2. **Scope Tab Scrolling**
   - All 12 scopes accessible
   - Smooth horizontal scrolling
   - Active state visible while scrolling

3. **Leaderboard List**
   - Long usernames truncate properly
   - Scores align correctly
   - Cards don't overflow
   - Smooth scrolling

4. **Profile Modal**
   - Opens smoothly from bottom
   - Stats grid displays properly
   - All content visible
   - Scrollable when needed

5. **Orientation Changes**
   - Layout adapts to landscape
   - No content cut off
   - Proper spacing maintained

## Future Enhancements

### Potential Additions
- Dynamic theme switching based on player type
- Dark mode toggle
- Custom color themes
- Accessibility improvements (high contrast mode)
- Animation transitions between themes
- Seasonal color schemes

### Performance Optimizations
- Memoize color calculations
- Lazy load theme modes
- Cache theme preferences
- Optimize re-renders on theme changes
