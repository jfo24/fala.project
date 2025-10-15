#!/bin/bash

# 🚀 Setup Development Build for Push Notifications
# This script helps you create a development build to test push notifications

echo "🚀 Setting up Development Build for Push Notifications..."
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
    echo "✅ EAS CLI installed"
else
    echo "✅ EAS CLI already installed"
fi

echo ""
echo "📋 Next steps:"
echo "1. Run: eas login"
echo "2. Run: eas build:configure"
echo "3. Run: eas build --profile development --platform android"
echo "4. Download and install the APK on your Android device"
echo "5. Test push notifications with phone locked!"
echo ""
echo "📱 This will create a development build that supports real push notifications"
echo "   even when the phone is locked or app is suspended."
echo ""
echo "📖 For detailed instructions, see: DEVELOPMENT_BUILD_GUIDE.md"
