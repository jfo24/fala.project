# ⚡ Quick Setup - Fastest Options
# This script shows you the fastest ways to test the app

Write-Host "⚡ Quick Setup - Fastest Options" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Choose your speed:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. INSTANT (0 minutes) - Web Browser:" -ForegroundColor Yellow
Write-Host "   expo start --web" -ForegroundColor White
Write-Host "   • Open http://localhost:19006" -ForegroundColor White
Write-Host "   • Web notifications only" -ForegroundColor White
Write-Host "   • Zero setup" -ForegroundColor White
Write-Host ""
Write-Host "2. FAST (2 minutes) - Expo Go:" -ForegroundColor Yellow
Write-Host "   expo start" -ForegroundColor White
Write-Host "   • Install Expo Go on phone" -ForegroundColor White
Write-Host "   • Scan QR code" -ForegroundColor White
Write-Host "   • Limited notifications" -ForegroundColor White
Write-Host ""
Write-Host "3. MEDIUM (15-20 minutes) - Development Build:" -ForegroundColor Yellow
Write-Host "   eas build --profile development --platform android" -ForegroundColor White
Write-Host "   • Real push notifications" -ForegroundColor White
Write-Host "   • Works with phone locked" -ForegroundColor White
Write-Host "   • Install APK on phone" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "   Expo Go CANNOT do real push notifications" -ForegroundColor White
Write-Host "   when phone is locked. This is a technical limitation." -ForegroundColor White
Write-Host ""
Write-Host "✅ For real push notifications:" -ForegroundColor Green
Write-Host "   You MUST use Development Build (option 3)" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see: QUICK_BUILD_GUIDE.md" -ForegroundColor Blue
