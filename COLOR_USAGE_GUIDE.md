# Color Usage Guide

## Brand Colors

### Primary - Royal Purple `#6C63FF`
**Usage:**
- Main buttons and CTAs
- Active tab indicators
- Primary headings
- Brand elements
- Navigation highlights
- Selected states

**Examples:**
```typescript
backgroundColor: theme.colors.primary
color: theme.colors.primary
borderColor: theme.colors.primary
```

### Secondary - Hot Pink `#FF4F81`
**Usage:**
- Secondary buttons
- Accent elements
- Hover states
- Secondary CTAs
- Feature highlights
- Important badges

**Examples:**
```typescript
backgroundColor: theme.colors.secondary
color: theme.colors.secondary
```

### Accent - Gold Yellow `#FFC736`
**Usage:**
- Highlights and emphasis
- Achievement badges
- #1 rank indicators
- Warning messages
- Special features
- Premium indicators

**Examples:**
```typescript
backgroundColor: theme.colors.accent
color: theme.colors.accent
```

## Background Colors

### Soft White `#F8FAFC` (Light Mode)
**Usage:**
- Main app background
- Card backgrounds
- Light mode screens
- Content areas

**Examples:**
```typescript
backgroundColor: theme.colors.background
```

### Deep Navy `#0F172A` (Dark Mode)
**Usage:**
- Dark mode background
- Modal overlays
- Dark themed screens
- Adult mode background
- Premium sections

**Examples:**
```typescript
backgroundColor: theme.colors.backgroundDark
```

## Text Colors

### Text - Deep Navy `#0F172A`
**Usage:**
- Primary text on light backgrounds
- Headings
- Body text
- Labels

**Examples:**
```typescript
color: theme.colors.text
```

### Text Light - Soft White `#F8FAFC`
**Usage:**
- Text on dark backgrounds
- Text on colored buttons
- Dark mode text

**Examples:**
```typescript
color: theme.colors.textLight
```

### Gray `#64748B`
**Usage:**
- Secondary text
- Placeholders
- Disabled states
- Subtle information
- Timestamps

**Examples:**
```typescript
color: theme.colors.gray
```

## Semantic Colors

### Success - Neon Green `#22C55E`
**Usage:**
- ✅ Correct matches
- Success messages
- Completed states
- Positive feedback
- Win indicators

**Examples:**
```typescript
backgroundColor: theme.colors.success // Correct match
borderColor: theme.colors.success
```

### Danger - Red `#EF4444`
**Usage:**
- ❌ Wrong matches
- Error messages
- Delete actions
- Failed states
- Negative feedback

**Examples:**
```typescript
backgroundColor: theme.colors.danger // Wrong match
color: theme.colors.danger
```

### Warning - Gold Yellow `#FFC736`
**Usage:**
- Warning messages
- Caution states
- Time running out
- Important notices

**Examples:**
```typescript
backgroundColor: theme.colors.warning
```

## Mode-Specific Colors

### Child Mode (Bright & Playful)
**Colors:**
- Primary: `#FF6B9D` (Bright Pink)
- Secondary: `#FFD93D` (Bright Yellow)
- Accent: `#6BCF7F` (Bright Green)
- Background: `#FFF5F7` (Very Light Pink)

**Usage:**
```typescript
backgroundColor: theme.modes.child.primary
```

**Characteristics:**
- High saturation
- Bright, cheerful colors
- Soft pastels for backgrounds
- Fun and energetic

### Teen Mode (Bold & Neon)
**Colors:**
- Primary: `#FF4F81` (Hot Pink)
- Secondary: `#6C63FF` (Royal Purple)
- Accent: `#00F5FF` (Neon Cyan)
- Background: `#1A1A2E` (Dark Blue)

**Usage:**
```typescript
backgroundColor: theme.modes.teen.background
color: theme.modes.teen.primary
```

**Characteristics:**
- Bold, vibrant colors
- Neon accents
- Dark backgrounds
- High contrast
- Trendy and modern

### Adult Mode (Dark & Premium)
**Colors:**
- Primary: `#6C63FF` (Royal Purple)
- Secondary: `#FF4F81` (Hot Pink)
- Accent: `#FFC736` (Gold Yellow)
- Background: `#0F172A` (Deep Navy)

**Usage:**
```typescript
backgroundColor: theme.modes.adult.background
color: theme.modes.adult.primary
```

**Characteristics:**
- Sophisticated palette
- Dark, premium feel
- Elegant and refined
- Professional appearance

## Component-Specific Usage

### Buttons
```typescript
// Primary Button
backgroundColor: theme.colors.primary
color: theme.colors.white

// Secondary Button
backgroundColor: theme.colors.secondary
color: theme.colors.white

// Outline Button
borderColor: theme.colors.primary
color: theme.colors.primary
```

### Cards
```typescript
// Light Card
backgroundColor: theme.colors.white
borderColor: theme.colors.gray + '20'

// Dark Card
backgroundColor: theme.colors.backgroundDark
color: theme.colors.textLight
```

### Game Elements
```typescript
// Correct Match
backgroundColor: theme.colors.success
borderColor: theme.colors.success

// Wrong Match
backgroundColor: theme.colors.danger
borderColor: theme.colors.danger

// Matched Card
borderColor: theme.colors.success
borderWidth: 3
```

### Leaderboard
```typescript
// Rank Badges
#1: theme.colors.accent (Gold)
#2: '#C0C0C0' (Silver)
#3: '#CD7F32' (Bronze)
Others: theme.colors.primary

// Active Tab
backgroundColor: theme.colors.primary
color: theme.colors.white

// Inactive Tab
backgroundColor: theme.colors.background
color: theme.colors.gray
```

### Navigation
```typescript
// Active Tab
tintColor: theme.colors.primary

// Inactive Tab
tintColor: theme.colors.gray

// Tab Bar Background
backgroundColor: theme.colors.white
```

## Accessibility Guidelines

### Contrast Ratios
- Text on background: Minimum 4.5:1
- Large text: Minimum 3:1
- Interactive elements: Minimum 3:1

### Color Combinations

**Good Combinations:**
- ✅ Royal Purple on Soft White
- ✅ Deep Navy text on Soft White
- ✅ Soft White text on Royal Purple
- ✅ Soft White text on Deep Navy
- ✅ Neon Green on Deep Navy
- ✅ Red on Soft White

**Avoid:**
- ❌ Hot Pink text on Royal Purple (low contrast)
- ❌ Gold Yellow text on Soft White (low contrast)
- ❌ Gray text on Hot Pink (low contrast)

## Implementation Examples

### Screen Background
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Soft White
  },
});
```

### Game Match Feedback
```typescript
// Correct match
<View style={{
  backgroundColor: theme.colors.success, // Neon Green
  borderColor: theme.colors.success,
  borderWidth: 2,
}}>
  <Text style={{ color: theme.colors.white }}>Correct!</Text>
</View>

// Wrong match
<View style={{
  backgroundColor: theme.colors.danger, // Red
  borderColor: theme.colors.danger,
  borderWidth: 2,
}}>
  <Text style={{ color: theme.colors.white }}>Try Again!</Text>
</View>
```

### Mode-Based Theming
```typescript
const getThemeForMode = (playerType: 'child' | 'teen' | 'adult') => {
  return theme.modes[playerType];
};

// Usage
const modeTheme = getThemeForMode(user.player_type);
<View style={{ backgroundColor: modeTheme.background }}>
  <Text style={{ color: modeTheme.primary }}>Welcome!</Text>
</View>
```

## Quick Reference

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary Button | Royal Purple | #6C63FF |
| Secondary Button | Hot Pink | #FF4F81 |
| Highlight | Gold Yellow | #FFC736 |
| Background (Light) | Soft White | #F8FAFC |
| Background (Dark) | Deep Navy | #0F172A |
| Correct Match | Neon Green | #22C55E |
| Wrong Match | Red | #EF4444 |
| Text (Light BG) | Deep Navy | #0F172A |
| Text (Dark BG) | Soft White | #F8FAFC |
| Secondary Text | Gray | #64748B |

## Testing Checklist

- [ ] All buttons use primary/secondary colors
- [ ] Backgrounds use Soft White or Deep Navy
- [ ] Correct matches show Neon Green
- [ ] Wrong matches show Red
- [ ] Text has sufficient contrast
- [ ] Mode-specific colors work for all player types
- [ ] Leaderboard uses proper rank colors
- [ ] Navigation uses primary color for active state
- [ ] Cards have proper background colors
- [ ] Modals use appropriate overlay colors
