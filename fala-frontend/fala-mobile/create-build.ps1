# 🚀 Create Development Build for Push Notifications
# This script creates a development build APK for testing push notifications

Write-Host "🚀 Creating Development Build for Push Notifications..." -ForegroundColor Green
Write-Host ""

# Check if EAS CLI is installed
try {
    $easVersion = eas --version 2>$null
    Write-Host "✅ EAS CLI installed (version: $easVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g eas-cli
    Write-Host "✅ EAS CLI installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Login to Expo (if not already logged in):" -ForegroundColor White
Write-Host "   eas login" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Configure EAS Build:" -ForegroundColor White
Write-Host "   eas build:configure" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Create Development Build:" -ForegroundColor White
Write-Host "   eas build --profile development --platform android" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Download APK:" -ForegroundColor White
Write-Host "   eas build:download [BUILD_ID]" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Install on your phone:" -ForegroundColor White
Write-Host "   • Transfer APK to phone" -ForegroundColor White
Write-Host "   • Install APK" -ForegroundColor White
Write-Host "   • Test push notifications!" -ForegroundColor White
Write-Host ""
Write-Host "📱 This will create a development build that supports real push notifications" -ForegroundColor Green
Write-Host "   even when the phone is locked or app is suspended." -ForegroundColor Green
Write-Host ""
Write-Host "📖 For detailed instructions, see: DEVELOPMENT_BUILD_GUIDE.md" -ForegroundColor Blue
