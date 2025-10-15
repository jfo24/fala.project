# 🔔 Test Push Notifications on Android Emulator
# This script helps you test push notifications on the Android emulator

Write-Host "🔔 Testing Push Notifications on Android Emulator..." -ForegroundColor Green
Write-Host ""

# Check if emulator is running
try {
    $devices = adb devices
    if ($devices -match "emulator") {
        Write-Host "✅ Android emulator is running" -ForegroundColor Green
    } else {
        Write-Host "❌ No Android emulator found. Please start an emulator first." -ForegroundColor Red
        Write-Host "   Open Android Studio → AVD Manager → Start emulator" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ ADB not found. Please install Android Studio first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Testing steps:" -ForegroundColor Cyan
Write-Host "1. Open the Fala app in the emulator" -ForegroundColor White
Write-Host "2. Login and go to 'Listen' mode" -ForegroundColor White
Write-Host "3. Lock the emulator (Ctrl+L or swipe up)" -ForegroundColor White
Write-Host "4. On another device/browser, go to talk mode" -ForegroundColor White
Write-Host "5. Search for listeners" -ForegroundColor White
Write-Host "6. Check if notification appears on locked emulator!" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Useful commands:" -ForegroundColor Yellow
Write-Host "• View logs: adb logcat | grep 'Fala'" -ForegroundColor White
Write-Host "• Install APK: adb install path/to/app.apk" -ForegroundColor White
Write-Host "• Open app: adb shell am start -n com.fala.mobile/.MainActivity" -ForegroundColor White
Write-Host ""
Write-Host "📱 Expected behavior:" -ForegroundColor Green
Write-Host "• Notification should appear on locked emulator screen" -ForegroundColor White
Write-Host "• Sound and vibration should work" -ForegroundColor White
Write-Host "• Tapping notification should open the app" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see: PC_TESTING_GUIDE.md" -ForegroundColor Blue
