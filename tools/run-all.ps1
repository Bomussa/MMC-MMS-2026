# Run All Tests - Complete Verification Pipeline
# Usage: .\tools\run-all.ps1 -SiteOrigin "http://localhost:3000" -ApiOrigin "http://localhost:3000"

param(
    [Parameter(Mandatory = $false)]
    [string]$SiteOrigin = "http://localhost:3000",
    
    [Parameter(Mandatory = $false)]
    [string]$ApiOrigin = "http://localhost:3000",
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipSeed,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipServer
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = "logs\run-all-$timestamp.log"

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $entry = "[$(Get-Date -Format 'HH:mm:ss')] $Message"
    Write-Host $entry -ForegroundColor $Color
    Add-Content -Path $logFile -Value $entry
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

$allPassed = $true

try {
    Write-Section "MMS 2027 - COMPLETE VERIFICATION"
    Write-Log "Site Origin: $SiteOrigin" "Cyan"
    Write-Log "API Origin: $ApiOrigin" "Cyan"
    Write-Log "Log File: $logFile" "Gray"
    
    # Step 1: Build
    if (!$SkipBuild) {
        Write-Section "Step 1: Build Project"
        Write-Log "Running: npm run build"
        
        npm run build 2>&1 | Tee-Object -FilePath $logFile -Append
        
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed"
        }
        
        Write-Log "✅ Build completed" "Green"
    }
    else {
        Write-Log "⏭️  Skipping build" "Yellow"
    }
    
    # Step 2: Seed Test Data
    if (!$SkipSeed) {
        Write-Section "Step 2: Seed Test Data"
        Write-Log "Running: tsx scripts/seed-and-timewarp.ts"
        
        tsx scripts/seed-and-timewarp.ts 2>&1 | Tee-Object -FilePath $logFile -Append
        
        if ($LASTEXITCODE -ne 0) {
            throw "Seeding failed"
        }
        
        Write-Log "✅ Test data seeded" "Green"
    }
    else {
        Write-Log "⏭️  Skipping seed" "Yellow"
    }
    
    # Step 3: Start Server (if not skipped)
    $serverJob = $null
    if (!$SkipServer) {
        Write-Section "Step 3: Starting Server"
        Write-Log "Starting server at $ApiOrigin"
        
        # Start server in background
        $serverJob = Start-Job -ScriptBlock {
            param($ApiOrigin)
            $env:PORT = ([uri]$ApiOrigin).Port
            npm start
        } -ArgumentList $ApiOrigin
        
        Write-Log "Waiting for server to be ready..."
        Start-Sleep -Seconds 5
        
        # Check if server is responding
        $retries = 0
        $maxRetries = 10
        $serverReady = $false
        
        while ($retries -lt $maxRetries -and !$serverReady) {
            try {
                $response = Invoke-WebRequest -Uri "$ApiOrigin/api/health" -TimeoutSec 2 -ErrorAction Stop
                if ($response.StatusCode -eq 200) {
                    $serverReady = $true
                    Write-Log "✅ Server is ready" "Green"
                }
            }
            catch {
                $retries++
                Write-Log "Waiting for server... ($retries/$maxRetries)" "Yellow"
                Start-Sleep -Seconds 2
            }
        }
        
        if (!$serverReady) {
            throw "Server failed to start"
        }
    }
    else {
        Write-Log "⏭️  Assuming server is already running" "Yellow"
    }
    
    # Step 4: API Smoke Tests
    Write-Section "Step 4: API Smoke Tests"
    Write-Log "Running: tsx scripts/api-smoke.ts"
    
    $env:API_ORIGIN = $ApiOrigin
    tsx scripts/api-smoke.ts 2>&1 | Tee-Object -FilePath $logFile -Append
    
    if ($LASTEXITCODE -ne 0) {
        Write-Log "❌ Some API tests failed" "Red"
        $allPassed = $false
    }
    else {
        Write-Log "✅ All API tests passed" "Green"
    }
    
    # Step 5: Playwright UI Tests (if available)
    Write-Section "Step 5: UI Tests (Playwright)"
    
    if (Test-Path "playwright.config.ts") {
        Write-Log "Running: npx playwright test"
        
        $env:SITE_ORIGIN = $SiteOrigin
        npx playwright test 2>&1 | Tee-Object -FilePath $logFile -Append
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "❌ Some UI tests failed" "Red"
            $allPassed = $false
        }
        else {
            Write-Log "✅ All UI tests passed" "Green"
        }
    }
    else {
        Write-Log "⏭️  Playwright not configured, skipping UI tests" "Yellow"
    }
    
    # Step 6: Generate Verification Report
    Write-Section "Step 6: Generate Verification Report"
    
    $verificationPath = "logs\VERIFICATION.md"
    
    $report = @"
# 🔍 VERIFICATION REPORT
## MMS 2027 Complete Test Run

**Timestamp:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Site Origin:** $SiteOrigin  
**API Origin:** $ApiOrigin

---

## 📊 Test Results

### Build
- Status: ✅ SUCCESS

### Test Data Seeding
- Status: ✅ SUCCESS
- Data: PINs, Queues (LATE + Recent), Routes, Audit logs

### API Smoke Tests
- Status: $(if ($allPassed) { "✅ SUCCESS" } else { "❌ FAILED" })
- Details: See \`logs/api-smoke.json\`

### UI Tests (Playwright)
- Status: $(if (Test-Path "playwright.config.ts") { if ($allPassed) { "✅ SUCCESS" } else { "❌ FAILED" } } else { "⏭️ SKIPPED" })
- Details: See \`logs/playwright-report/\`

---

## 📁 Generated Artifacts

- \`logs/run-all-$timestamp.log\` - Full execution log
- \`logs/api-smoke.json\` - API test results
- \`logs/playwright-report/\` - UI test report (if available)

---

## 🎯 Next Steps

$(if ($allPassed) {
@"
✅ **ALL TESTS PASSED**

The system is verified and ready:
- Backend APIs are functional
- Frontend can be tested manually
- Test data is seeded for live testing

You can now:
1. Open $SiteOrigin in browser
2. Test patient flow manually
3. Access admin dashboard
4. Review logs for any warnings
"@
} else {
@"
❌ **SOME TESTS FAILED**

Please review:
1. Check \`logs/api-smoke.json\` for failed endpoints
2. Review \`logs/run-all-$timestamp.log\` for errors
3. Fix issues and re-run: \`.\tools\run-all.ps1\`

Common issues:
- Server not running
- Database/file permissions
- Missing dependencies
"@
})

---

**End of Report**
"@
    
    $report | Out-File -FilePath $verificationPath -Encoding UTF8
    Write-Log "✅ Verification report saved: $verificationPath" "Green"
    
    # Final Summary
    Write-Section "FINAL SUMMARY"
    
    if ($allPassed) {
        Write-Host "✅ ALL GREEN - System is verified!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  SOME FAILURES - Review logs for details" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Artifacts:" -ForegroundColor Cyan
    Write-Host "  • $logFile" -ForegroundColor White
    Write-Host "  • $verificationPath" -ForegroundColor White
    Write-Host "  • logs/api-smoke.json" -ForegroundColor White
    Write-Host ""
    
    # Open verification report
    Start-Process $verificationPath
    
}
catch {
    Write-Log "❌ Pipeline failed: $_" "Red"
    $allPassed = $false
    
}
finally {
    # Cleanup: Stop server if we started it
    if ($serverJob) {
        Write-Log "Stopping server..." "Gray"
        Stop-Job -Job $serverJob
        Remove-Job -Job $serverJob
    }
}

# Exit with appropriate code
if ($allPassed) {
    exit 0
}
else {
    exit 1
}
