# 🌐 Start Web Version of the App
# This script starts the web version for instant testing

Write-Host "🌐 Starting Web Version of the App..." -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting web server..." -ForegroundColor Cyan
Write-Host ""

# Start the web version
npx expo start --web

Write-Host ""
Write-Host "✅ Web server started!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Open your browser and go to:" -ForegroundColor Yellow
Write-Host "   http://localhost:19006" -ForegroundColor White
Write-Host ""
Write-Host "🎯 What you can test:" -ForegroundColor Cyan
Write-Host "   • Login (simulated)" -ForegroundColor White
Write-Host "   • Listen/Talk modes" -ForegroundColor White
Write-Host "   • Chat functionality" -ForegroundColor White
Write-Host "   • Mira AI conversations" -ForegroundColor White
Write-Host "   • Web notifications" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   • Open multiple browser tabs to test chat" -ForegroundColor White
Write-Host "   • Allow notifications when browser asks" -ForegroundColor White
Write-Host "   • Use F12 to see console logs" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see: WEB_TESTING_GUIDE.md" -ForegroundColor Blue
