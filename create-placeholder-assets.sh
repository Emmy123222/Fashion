#!/bin/bash
# Create placeholder assets for Fashion Match Game

echo "Creating placeholder assets..."

# Create directories
mkdir -p assets/audio/music
mkdir -p assets/audio/sfx
mkdir -p assets/avatars
mkdir -p assets/outfits

# Create placeholder images using ImageMagick (if available) or download
# For now, create simple colored squares

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "Creating images with ImageMagick..."
    
    # App icon
    convert -size 1024x1024 xc:#6a5acd -gravity center -pointsize 200 -fill white -annotate +0+0 "FM" assets/icon.png
    
    # Splash screen
    convert -size 1284x2778 xc:#6a5acd -gravity center -pointsize 300 -fill white -annotate +0+0 "Fashion\nMatch" assets/splash.png
    
    # Adaptive icon
    cp assets/icon.png assets/adaptive-icon.png
    
    # Favicon
    convert -size 48x48 xc:#6a5acd -gravity center -pointsize 24 -fill white -annotate +0+0 "FM" assets/favicon.png
    
    # Logo
    convert -size 512x512 xc:#6a5acd -gravity center -pointsize 100 -fill white -annotate +0+0 "Fashion\nMatch" assets/logo.png
    
    # Card back
    convert -size 300x300 xc:#9c88ff -gravity center -pointsize 60 -fill white -annotate +0+0 "?" assets/card-back.png
    
    # Check icon
    convert -size 64x64 xc:none -fill "#2ecc71" -draw "circle 32,32 32,8" assets/check-icon.png
    
    # Onboarding images
    convert -size 800x600 xc:#FFB6C1 -gravity center -pointsize 80 -fill white -annotate +0+0 "Discover\nFashion" assets/onboarding1.png
    convert -size 800x600 xc:#9c88ff -gravity center -pointsize 80 -fill white -annotate +0+0 "Create\nOutfits" assets/onboarding2.png
    convert -size 800x600 xc:#2ecc71 -gravity center -pointsize 80 -fill white -annotate +0+0 "Share &\nInspire" assets/onboarding3.png
    
    echo "✅ Placeholder images created!"
else
    echo "⚠️  ImageMagick not found. Creating simple text files as placeholders..."
    echo "Please add real images manually or download from:"
    echo "  - https://placeholder.com"
    echo "  - https://via.placeholder.com"
    echo ""
    echo "Required images:"
    echo "  - assets/icon.png (1024x1024)"
    echo "  - assets/splash.png (1284x2778)"
    echo "  - assets/adaptive-icon.png (1024x1024)"
    echo "  - assets/favicon.png (48x48)"
    echo "  - assets/logo.png (512x512)"
    echo "  - assets/card-back.png (300x300)"
    echo "  - assets/check-icon.png (64x64)"
    echo "  - assets/onboarding1.png (800x600)"
    echo "  - assets/onboarding2.png (800x600)"
    echo "  - assets/onboarding3.png (800x600)"
fi

echo ""
echo "Done! You can now run: npm start"
