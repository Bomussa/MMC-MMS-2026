# Safe Edit with Rollback
# Usage: .\tools\safe-edit.ps1 -Command "npm run build"

param(
    [Parameter(Mandatory = $true)]
    [string]$Command,
    
    [Parameter(Mandatory = $false)]
    [string]$Description = "Auto backup"
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backups\safe-edit-$timestamp"
$logFile = "logs\safe-edit-$timestamp.log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $entry = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [$Level] $Message"
    Write-Host $entry
    Add-Content -Path $logFile -Value $entry
}

try {
    # Create backup
    Write-Log "Creating backup: $backupDir"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # Backup critical directories
    $criticalDirs = @("src", "config", "data", "public", "package.json", "tsconfig.json", "vite.config.js")
    foreach ($dir in $criticalDirs) {
        if (Test-Path $dir) {
            Copy-Item -Path $dir -Destination "$backupDir\" -Recurse -Force
            Write-Log "Backed up: $dir"
        }
    }
    
    # Save git status
    $gitStatus = git status --porcelain 2>&1
    $gitStatus | Out-File "$backupDir\git-status.txt"
    Write-Log "Git status saved"
    
    # Execute command
    Write-Log "Executing: $Command" "EXEC"
    $output = Invoke-Expression $Command 2>&1
    $exitCode = $LASTEXITCODE
    
    $output | Out-File "$backupDir\command-output.txt"
    Write-Log "Command output saved"
    
    if ($exitCode -ne 0) {
        Write-Log "Command failed with exit code: $exitCode" "ERROR"
        throw "Command execution failed"
    }
    
    Write-Log "✅ Command completed successfully" "SUCCESS"
    
    # Create success marker
    "SUCCESS" | Out-File "$backupDir\status.txt"
    
    exit 0
    
}
catch {
    Write-Log "❌ Error occurred: $_" "ERROR"
    Write-Log "Backup preserved at: $backupDir" "ROLLBACK"
    
    # Create failure marker
    "FAILED: $_" | Out-File "$backupDir\status.txt"
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════" -ForegroundColor Red
    Write-Host "  ROLLBACK REQUIRED" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "Backup location: $backupDir" -ForegroundColor Cyan
    Write-Host "To rollback manually:" -ForegroundColor White
    Write-Host "  .\tools\rollback-manager.ps1 -BackupDir '$backupDir'" -ForegroundColor Yellow
    Write-Host ""
    
    exit 1
}
