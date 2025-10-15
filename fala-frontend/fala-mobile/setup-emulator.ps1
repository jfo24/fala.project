# 🖥️ Setup Android Emulator for Push Notifications Testing
# This script helps you set up Android emulator to test push notifications on PC

Write-Host "🖥️ Setting up Android Emulator for Push Notifications Testing..." -ForegroundColor Green
Write-Host ""

# Check if Android SDK is installed
try {
    $androidHome = $env:ANDROID_HOME
    if ($androidHome) {
        Write-Host "✅ Android SDK found at: $androidHome" -ForegroundColor Green
    } else {
        Write-Host "❌ Android SDK not found. Please install Android Studio first." -ForegroundColor Red
        Write-Host "   Download from: https://developer.android.com/studio" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Android SDK not found. Please install Android Studio first." -ForegroundColor Red
    Write-Host "   Download from: https://developer.android.com/studio" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open Android Studio" -ForegroundColor White
Write-Host "2. Go to AVD Manager (Tools → AVD Manager)" -ForegroundColor White
Write-Host "3. Create Virtual Device → Choose Pixel 4 or similar" -ForegroundColor White
Write-Host "4. Select System Image → Android 11+ (API 30+)" -ForegroundColor White
Write-Host "5. Configure: RAM 4GB, Storage 8GB" -ForegroundColor White
Write-Host "6. Start the emulator" -ForegroundColor White
Write-Host ""
Write-Host "🚀 After emulator is running:" -ForegroundColor Yellow
Write-Host "1. Create development build: eas build --profile development --platform android" -ForegroundColor White
Write-Host "2. Download APK and drag to emulator" -ForegroundColor White
Write-Host "3. Test push notifications with locked emulator!" -ForegroundColor White
Write-Host ""
Write-Host "📱 This will allow you to test real push notifications on PC" -ForegroundColor Green
Write-Host "   even when the emulator is locked or app is suspended." -ForegroundColor Green
Write-Host ""
Write-Host "📖 For detailed instructions, see: PC_TESTING_GUIDE.md" -ForegroundColor Blue
