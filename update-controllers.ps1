# ============================================
# SUPABASE CONTROLLER AUTO-UPDATE SCRIPT
# ============================================
# This script updates all controllers to use Supabase
#
# Usage: 
#   cd "c:\Users\Dhruv Lohana\Desktop\Naya Project\CC Backend"
#   .\update-controllers.ps1

Write-Host "`n🔄 Updating controllers to Supabase..." -ForegroundColor Cyan

# Medication Controller
Write-Host "`nUpdating medication.controller.js..." -ForegroundColor Yellow
Copy-Item "updates\medication.controller.new.js" -Destination "controllers\medication.controller.js" -Force
Write-Host "✅ medication.controller.js updated" -ForegroundColor Green

Write-Host "`n✨ Update complete!" -ForegroundColor Green
Write-Host "`nUpdated files:" -ForegroundColor Cyan
Write-Host "  ✅ controllers/medication.controller.js"

Write-Host "`n⏭️  Remaining controllers to update:" -ForegroundColor Yellow
Write-Host "  - dose.controller.js"
Write-Host "  - notification.controller.js"
Write-Host "  - report.controller.js"
Write-Host "  - link.controller.js"
Write-Host "  - donor.controller.js"

Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm install"
Write-Host "2. Setup database schema in Supabase"
Write-Host "3. Run: npm run dev"
Write-Host ""
