# Rollback Manager
# Usage: .\tools\rollback-manager.ps1 -BackupDir "backups\safe-edit-20250116_100000"

param(
    [Parameter(Mandatory = $false)]
    [string]$BackupDir = "",
    
    [Parameter(Mandatory = $false)]
    [switch]$List,
    
    [Parameter(Mandatory = $false)]
    [switch]$Auto
)

$ErrorActionPreference = "Stop"

function Get-LatestBackup {
    $backups = Get-ChildItem -Path "backups" -Directory -Filter "safe-edit-*" | Sort-Object Name -Descending
    if ($backups.Count -eq 0) {
        throw "No backups found"
    }
    return $backups[0].FullName
}

function Show-BackupList {
    Write-Host ""
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  Available Backups" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    $backups = Get-ChildItem -Path "backups" -Directory -Filter "safe-edit-*" | Sort-Object Name -Descending
    
    if ($backups.Count -eq 0) {
        Write-Host "  No backups found" -ForegroundColor Red
        return
    }
    
    $index = 1
    foreach ($backup in $backups) {
        $statusFile = Join-Path $backup.FullName "status.txt"
        $status = "UNKNOWN"
        if (Test-Path $statusFile) {
            $status = Get-Content $statusFile -Raw
        }
        
        $statusColor = if ($status -like "SUCCESS*") { "Green" } else { "Red" }
        Write-Host "  [$index] $($backup.Name)" -ForegroundColor White
        Write-Host "      Status: " -NoNewline -ForegroundColor Gray
        Write-Host $status.Trim() -ForegroundColor $statusColor
        Write-Host ""
        $index++
    }
}

function Restore-Backup {
    param([string]$Path)
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  ROLLBACK IN PROGRESS" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Restoring from: $Path" -ForegroundColor Cyan
    Write-Host ""
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $rollbackLog = "logs\rollback-$timestamp.log"
    
    # Restore each item
    $items = Get-ChildItem -Path $Path -Exclude "status.txt", "git-status.txt", "command-output.txt"
    
    foreach ($item in $items) {
        $targetPath = $item.Name
        
        if (Test-Path $targetPath) {
            # Backup current before overwriting
            $tempBackup = "backups\pre-rollback-$timestamp"
            if (!(Test-Path $tempBackup)) {
                New-Item -ItemType Directory -Path $tempBackup -Force | Out-Null
            }
            Copy-Item -Path $targetPath -Destination "$tempBackup\" -Recurse -Force
            Write-Host "  Backed up current: $targetPath → $tempBackup" -ForegroundColor Gray
        }
        
        # Restore from backup
        Copy-Item -Path $item.FullName -Destination "." -Recurse -Force
        Write-Host "  ✅ Restored: $targetPath" -ForegroundColor Green
        
        "Restored $targetPath from $Path" | Add-Content $rollbackLog
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ ROLLBACK COMPLETED" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "Log saved: $rollbackLog" -ForegroundColor Cyan
    Write-Host ""
}

# Main logic
try {
    if ($List) {
        Show-BackupList
        exit 0
    }
    
    if ($Auto) {
        $BackupDir = Get-LatestBackup
        Write-Host "Auto-selected latest backup: $BackupDir" -ForegroundColor Yellow
    }
    
    if ($BackupDir -eq "") {
        Write-Host "Usage:" -ForegroundColor Yellow
        Write-Host "  .\tools\rollback-manager.ps1 -List" -ForegroundColor White
        Write-Host "  .\tools\rollback-manager.ps1 -Auto" -ForegroundColor White
        Write-Host "  .\tools\rollback-manager.ps1 -BackupDir 'backups\safe-edit-YYYYMMDD_HHMMSS'" -ForegroundColor White
        exit 1
    }
    
    if (!(Test-Path $BackupDir)) {
        throw "Backup directory not found: $BackupDir"
    }
    
    Restore-Backup -Path $BackupDir
    
}
catch {
    Write-Host ""
    Write-Host "❌ Rollback failed: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}
