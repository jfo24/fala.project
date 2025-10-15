# 🚀 Setup Development Build for Push Notifications
# This script helps you create a development build to test push notifications

Write-Host "🚀 Setting up Development Build for Push Notifications..." -ForegroundColor Green
Write-Host ""

# Check if EAS CLI is installed
try {
    $easVersion = eas --version 2>$null
    Write-Host "✅ EAS CLI already installed (version: $easVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @expo/eas-cli
    Write-Host "✅ EAS CLI installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: eas login" -ForegroundColor White
Write-Host "2. Run: eas build:configure" -ForegroundColor White
Write-Host "3. Run: eas build --profile development --platform android" -ForegroundColor White
Write-Host "4. Download and install the APK on your Android device" -ForegroundColor White
Write-Host "5. Test push notifications with phone locked!" -ForegroundColor White
Write-Host ""
Write-Host "📱 This will create a development build that supports real push notifications" -ForegroundColor Yellow
Write-Host "   even when the phone is locked or app is suspended." -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 For detailed instructions, see: DEVELOPMENT_BUILD_GUIDE.md" -ForegroundColor Blue
