# Validation Coverage Check Script (PowerShell)
# Purpose: Automatically detect Commands/Queries without corresponding Validator classes
# Usage: .\check-validators.ps1

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Validation Coverage Check" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Counters
$totalCommands = 0
$missingValidators = 0
$totalQueries = 0
$commandsWithValidators = @()
$commandsMissingValidators = @()

# Check Application directory exists
$appDir = ".\TenantManagement\ERPEZ.TenantManagement.Application"
if (-not (Test-Path $appDir)) {
    Write-Host "Error: Application directory not found at $appDir" -ForegroundColor Red
    exit 1
}

Write-Host "Scanning for Commands without Validators..." -ForegroundColor Yellow
Write-Host "-------------------------------------------"
Write-Host ""

# Find all Command.cs files (excluding Validator files)
$commandFiles = Get-ChildItem -Path "$appDir\Features" -Recurse -Filter "*Command.cs" | 
    Where-Object { $_.Name -notmatch "Validator" }

foreach ($commandFile in $commandFiles) {
    $totalCommands++
    
    $dir = $commandFile.DirectoryName
    $filename = $commandFile.Name
    
    # Generate expected validator filename
    $validatorName = $filename -replace "Command\.cs$", "CommandValidator.cs"
    $validatorPath = Join-Path $dir $validatorName
    
    # Check if validator exists
    if (-not (Test-Path $validatorPath)) {
        Write-Host "✗ MISSING -" -ForegroundColor Red -NoNewline
        Write-Host " $($commandFile.FullName)"
        Write-Host "  Expected: $validatorPath" -ForegroundColor Yellow
        $missingValidators++
        $commandsMissingValidators += [PSCustomObject]@{
            Command = $commandFile.FullName
            ExpectedValidator = $validatorPath
        }
    } else {
        Write-Host "✓ FOUND   -" -ForegroundColor Green -NoNewline
        Write-Host " $($commandFile.FullName)"
        $commandsWithValidators += $commandFile.FullName
    }
}

Write-Host ""
Write-Host "Scanning for Queries with Complex Validation..." -ForegroundColor Yellow
Write-Host "------------------------------------------------"
Write-Host ""

# Find all Query.cs files
$queryFiles = Get-ChildItem -Path "$appDir\Features" -Recurse -Filter "*Query.cs" | 
    Where-Object { $_.Name -notmatch "Validator" }

foreach ($queryFile in $queryFiles) {
    $totalQueries++
    
    $dir = $queryFile.DirectoryName
    $filename = $queryFile.Name
    
    # Generate expected validator filename
    $validatorName = $filename -replace "Query\.cs$", "QueryValidator.cs"
    $validatorPath = Join-Path $dir $validatorName
    
    # Check if validator exists
    if (-not (Test-Path $validatorPath)) {
        Write-Host "⚠ NO VALIDATOR -" -ForegroundColor Yellow -NoNewline
        Write-Host " $($queryFile.FullName)"
    } else {
        Write-Host "✓ FOUND        -" -ForegroundColor Green -NoNewline
        Write-Host " $($queryFile.FullName)"
    }
}

# Summary
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Commands:" -ForegroundColor White
Write-Host "  Total: $totalCommands"
Write-Host "  With Validators: $($totalCommands - $missingValidators)" -ForegroundColor Green
Write-Host "  Missing Validators: $missingValidators" -ForegroundColor $(if ($missingValidators -gt 0) { "Red" } else { "Green" })

if ($totalCommands -gt 0) {
    $coverage = [math]::Round((($totalCommands - $missingValidators) / $totalCommands) * 100, 2)
    Write-Host "  Coverage: $coverage%" -ForegroundColor $(if ($coverage -eq 100) { "Green" } else { "Yellow" })
}

Write-Host ""
Write-Host "Queries:" -ForegroundColor White
Write-Host "  Total: $totalQueries"
Write-Host ""

# Detailed missing validators list
if ($missingValidators -gt 0) {
    Write-Host "======================================" -ForegroundColor Red
    Write-Host "  Missing Validators Details" -ForegroundColor Red
    Write-Host "======================================" -ForegroundColor Red
    Write-Host ""
    
    foreach ($item in $commandsMissingValidators) {
        $commandName = Split-Path $item.Command -Leaf
        Write-Host "  Command: $commandName" -ForegroundColor Yellow
        Write-Host "    File: $($item.Command)" -ForegroundColor Gray
        Write-Host "    Expected Validator: $($item.ExpectedValidator)" -ForegroundColor Gray
        Write-Host ""
    }
}

# Exit with error if missing validators
if ($missingValidators -gt 0) {
    Write-Host "[X] Action Required: $missingValidators command(s) need validators!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Review each missing validator above"
    Write-Host "  2. Create validator classes following the pattern in VALIDATION_GUIDE.md"
    Write-Host "  3. Run this script again to verify"
    Write-Host ""
    
    # Optionally generate validator template
    $generateTemplate = Read-Host "Generate validator template files? (Y/N)"
    if ($generateTemplate -eq "Y" -or $generateTemplate -eq "y") {
        foreach ($item in $commandsMissingValidators) {
            $commandName = [System.IO.Path]::GetFileNameWithoutExtension($item.Command) -replace "Command$", ""
            $validatorContent = @"
using FluentValidation;

namespace $((Get-Content $item.Command | Select-String "namespace" | Select-Object -First 1) -replace "namespace ", "" -replace ";", "");

/// <summary>
/// Validator for ${commandName}Command.
/// TODO: Add validation rules
/// </summary>
public class ${commandName}CommandValidator : AbstractValidator<${commandName}Command>
{
    public ${commandName}CommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
"@
            Set-Content -Path $item.ExpectedValidator -Value $validatorContent -Encoding UTF8
            Write-Host "[OK] Generated template: $($item.ExpectedValidator)" -ForegroundColor Green
        }
        Write-Host ""
        Write-Host "Templates generated! Please update them with actual validation rules." -ForegroundColor Green
    }
    
    exit 1
} else {
    Write-Host "[OK] All commands have validators!" -ForegroundColor Green
    Write-Host ""
    exit 0
}
