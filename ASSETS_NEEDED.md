# Assets Needed for Fashion Match Game

## 🎨 Required Image Assets

### App Icons & Branding
```
assets/
├── icon.png (1024x1024) - App icon
├── adaptive-icon.png (1024x1024) - Android adaptive icon
├── splash.png (1284x2778) - Splash screen
├── logo.png (512x512) - App logo
└── favicon.png (48x48) - Web favicon
```

### Onboarding Images
```
assets/
├── onboarding1.png (800x600) - First onboarding slide
├── onboarding2.png (800x600) - Second onboarding slide
└── onboarding3.png (800x600) - Third onboarding slide
```

### Game Assets
```
assets/
├── card-back.png (300x300) - Back of fashion card
├── check-icon.png (64x64) - Checkmark for matched cards
└── avatars/
    ├── avatar1.png (128x128) - Default avatar 1
    ├── avatar2.png (128x128) - Default avatar 2
    └── avatar3.png (128x128) - Default avatar 3
```

### Fashion Item Placeholders (Optional - can use URLs)
```
assets/outfits/
├── outfit1.jpg (600x600) - Sample outfit 1
├── outfit2.jpg (600x600) - Sample outfit 2
└── outfit3.jpg (600x600) - Sample outfit 3
```

## 🎵 Audio Assets (Optional for MVP)

### Music
```
assets/audio/music/
└── background.mp3 - Background music (loopable, 2-3 minutes)
```

### Sound Effects
```
assets/audio/sfx/
├── flip.mp3 - Card flip sound (0.2s)
├── match.mp3 - Successful match sound (0.5s)
├── win.mp3 - Game win sound (2s)
├── lose.mp3 - Game over sound (1s)
└── combo.mp3 - Combo achievement sound (0.5s)
```

## 📦 Quick Setup Options

### Option 1: Use Placeholders (Fastest)
Keep using the current placeholder URLs from the seed data. The game works fine with these.

### Option 2: Free Stock Images
Download free images from:
- **Unsplash** (https://unsplash.com) - High quality photos
- **Pexels** (https://pexels.com) - Free stock photos
- **Flaticon** (https://flaticon.com) - Icons and graphics
- **Freepik** (https://freepik.com) - Vectors and illustrations

### Option 3: AI-Generated (Best)
Use AI to generate custom fashion images:
- **Stable Diffusion** via Replicate
- **DALL-E** via OpenAI
- **Midjourney** (requires subscription)

## 🎨 Design Specifications

### Color Scheme (from theme)
```
Primary: #6a5acd (Purple)
Secondary: #9c88ff (Light Purple)
Success: #2ecc71 (Green)
Danger: #e74c3c (Red)
Warning: #f39c12 (Orange)
Background: #f8f9fa (Light Gray)
```

### Card Design Guidelines
- **Size**: 300x300px minimum
- **Format**: PNG or JPG
- **Style**: Clean, modern, high contrast
- **Background**: Solid color or subtle pattern
- **Border**: Optional rounded corners

### Icon Design Guidelines
- **Size**: 64x64px minimum (vector preferred)
- **Format**: PNG with transparency
- **Style**: Simple, recognizable
- **Colors**: Match app theme

## 🚀 Asset Generation Prompts (for AI)

### For Fashion Items
```
"A professional product photo of [item], centered on white background, 
high quality, studio lighting, fashion photography, clean and modern"

Examples:
- "A professional product photo of red sneakers, centered on white background..."
- "A professional product photo of summer floral dress, centered on white background..."
- "A professional product photo of baseball cap, centered on white background..."
```

### For Card Back Design
```
"A decorative pattern for the back of a playing card, purple and white colors,
elegant, modern, geometric pattern, suitable for a fashion game"
```

### For App Icon
```
"A modern app icon for a fashion matching game, purple gradient background,
simple clothing hanger or dress icon, minimalist, professional"
```

## 📝 Asset Checklist

### Minimum Required (to run app)
- [ ] icon.png
- [ ] splash.png
- [ ] card-back.png
- [ ] check-icon.png
- [ ] logo.png

### Recommended
- [ ] 3 onboarding images
- [ ] 3 default avatars
- [ ] 3 sample outfit images

### Optional (for polish)
- [ ] Background music
- [ ] Sound effects (5 files)
- [ ] Additional fashion item images

## 🔧 How to Add Assets

### 1. Create Assets Folder
```bash
mkdir -p assets/audio/music assets/audio/sfx assets/avatars assets/outfits
```

### 2. Add Images
Place your images in the appropriate folders.

### 3. Update Code References
The code already references these assets. Just make sure filenames match:
- `assets/logo.png`
- `assets/card-back.png`
- `assets/check-icon.png`
- etc.

### 4. For Fashion Items
Either:
- **Option A**: Keep using placeholder URLs (works fine)
- **Option B**: Upload to Supabase Storage and update database
- **Option C**: Use AI generation service in production

## 💡 Pro Tips

### For Development
- Use placeholder URLs (already set up)
- Focus on functionality first
- Add real assets later

### For Demo
- Use high-quality stock images
- Ensure consistent style
- Add at least 20-30 fashion items

### For Production
- Use AI-generated images
- Ensure all images are licensed
- Optimize image sizes
- Use CDN for fast loading

## 🎯 Priority Order

1. **Critical** (needed to run): icon.png, splash.png
2. **Important** (for good UX): card-back.png, check-icon.png, logo.png
3. **Nice to have**: onboarding images, avatars
4. **Polish**: audio files, additional images

## 📦 Asset Packages Available

### Free Starter Pack
- Basic icons from Flaticon
- Stock photos from Unsplash
- Free sound effects from Freesound

### Premium Pack (Recommended)
- AI-generated fashion items (100+ items)
- Custom app icon and branding
- Professional sound effects
- Background music

### DIY Approach
- Generate with AI (Stable Diffusion)
- Edit with Figma/Photoshop
- Source from free stock sites
- Record/find free audio

---

**Note**: The app currently works with placeholder images. You can start testing immediately and add real assets later!
