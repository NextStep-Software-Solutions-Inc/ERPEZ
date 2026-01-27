# DTO Contract Validation Script (PowerShell)
# Purpose: Verify queries/commands return types match controller expectations
# Usage: .\scripts\check-dto-contracts.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  API Contract Validation Check" -ForegroundColor Cyan
Write-Host "  Verifying Query/Command ↔ Controller Match" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Counters
$totalViolations = 0
$totalQueries = 0
$totalCommands = 0
$totalMismatches = 0
$violations = @()

# Application and API directories
$appDirs = @(
    ".\TenantManagement\ERPEZ.TenantManagement.Application",
    ".\ERPEZ\ERPEZ.Application"
)
$apiDirs = @(
    ".\TenantManagement\ERPEZ.TenantManagement.Api\Controllers",
    ".\ERPEZ\ERPEZ.Api\Controllers"
)

Write-Host "Phase 1: Detecting Domain.Entities in return types..." -ForegroundColor White
Write-Host "------------------------------------------------------------" -ForegroundColor White
Write-Host ""

foreach ($appDir in $appDirs) {
    if (-not (Test-Path $appDir)) {
        Write-Host "Warning: Application directory not found at $appDir - skipping" -ForegroundColor Yellow
        continue
    }

    Write-Host ""
    Write-Host "Scanning: $appDir" -ForegroundColor Blue

    # Check Query files
    $queryFiles = Get-ChildItem -Path "$appDir\Features" -Recurse -Filter "*Query.cs" | 
                  Where-Object { $_.DirectoryName -like "*\Queries\*" -and $_.Name -notlike "*Validator.cs" }

    foreach ($queryFile in $queryFiles) {
        $totalQueries++
        $content = Get-Content $queryFile.FullName -Raw

        if ($content -match "IRequest<.*Domain\.Entities\." -or $content -match "PaginatedQuery<.*Domain\.Entities\.") {
            Write-Host "✗ ENTITY LEAK - $($queryFile.FullName)" -ForegroundColor Red
            
            $lines = Get-Content $queryFile.FullName
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match "IRequest<.*Domain\.Entities\.|PaginatedQuery<.*Domain\.Entities\.") {
                    Write-Host "  Line $($i + 1): $($lines[$i].Trim())" -ForegroundColor Yellow
                }
            }
            
            $totalViolations++
            $violations += $queryFile.FullName
        }
    }

    # Check Command files
    $commandFiles = Get-ChildItem -Path "$appDir\Features" -Recurse -Filter "*Command.cs" | 
                    Where-Object { $_.DirectoryName -like "*\Commands\*" -and $_.Name -notlike "*Validator.cs" }

    foreach ($commandFile in $commandFiles) {
        $totalCommands++
        $content = Get-Content $commandFile.FullName -Raw

        if ($content -match "IRequest<.*Domain\.Entities\.") {
            Write-Host "✗ ENTITY LEAK - $($commandFile.FullName)" -ForegroundColor Red
            
            $lines = Get-Content $commandFile.FullName
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match "IRequest<.*Domain\.Entities\.") {
                    Write-Host "  Line $($i + 1): $($lines[$i].Trim())" -ForegroundColor Yellow
                }
            }
            
            $totalViolations++
            $violations += $commandFile.FullName
        }
    }
}

Write-Host ""
Write-Host "Phase 2: Verifying Controller ↔ Query/Command Match..." -ForegroundColor White
Write-Host "------------------------------------------------------------" -ForegroundColor White

for ($i = 0; $i -lt $apiDirs.Count; $i++) {
    $apiDir = $apiDirs[$i]
    $appDir = $appDirs[$i]
    
    if (-not (Test-Path $apiDir) -or -not (Test-Path $appDir)) {
        continue
    }

    Write-Host ""
    Write-Host "Checking: $apiDir" -ForegroundColor Blue

    $controllerFiles = Get-ChildItem -Path $apiDir -Filter "*Controller.cs" -ErrorAction SilentlyContinue

    foreach ($controllerFile in $controllerFiles) {
        $controllerContent = Get-Content $controllerFile.FullName -Raw
        
        # Split content into methods by matching method signatures with balanced braces
        $methodPattern = '(?s)((?:\[.*?\]\s*)*(?:public|private)\s+(?:async\s+)?Task[^{]*\{(?:[^{}]|(?<o>\{)|(?<-o>\}))*(?(o)(?!))\})'
        $methods = [regex]::Matches($controllerContent, $methodPattern)
        
        foreach ($method in $methods) {
            $methodText = $method.Value
            
            # Check if this method has a mediator.Send call
            if ($methodText -match "mediator\.Send\(new\s+([A-Za-z0-9]+(?:Query|Command))") {
                $queryOrCommand = $Matches[1]
                
                # Find ProducesResponseType for Status200OK in this method
                $expectedType = $null
                
                # Try different 200 OK patterns (prioritize explicit 200 OK)
                if ($methodText -match "ProducesResponseType\(typeof\(([^)]+)\).*Status200OK") {
                    $expectedType = $Matches[1]
                } elseif ($methodText -match "ProducesResponseType\(typeof\(([^)]+)\).*StatusCodes\.Status200OK") {
                    $expectedType = $Matches[1]
                } elseif ($methodText -match "ProducesResponseType\(typeof\(([^)]+)\),\s*200") {
                    $expectedType = $Matches[1]
                } elseif ($methodText -match "ProducesResponseType\(typeof\(([^)]+)\)") {
                    # Fallback to first ProducesResponseType if no explicit 200 OK
                    $expectedType = $Matches[1]
                }
                
                if ($expectedType) {
                    # Find the actual query/command file
                    $actualFile = Get-ChildItem -Path "$appDir\Features" -Recurse -Filter "$queryOrCommand.cs" -ErrorAction SilentlyContinue | Select-Object -First 1
                    
                    if ($actualFile) {
                        $actualContent = Get-Content $actualFile.FullName -Raw
                        
                        # Extract actual return type
                        $actualReturnType = $null
                        if ($actualContent -match "(IRequest|PaginatedQuery)<([^>]+)>") {
                            $actualReturnType = $Matches[2]
                        }
                        
                        # Check if query/command returns Domain.Entities but controller expects DTO
                        if ($actualReturnType -match "Domain\.Entities") {
                            if ($expectedType -notmatch "Domain\.Entities") {
                                Write-Host "✗ MISMATCH - $queryOrCommand" -ForegroundColor Magenta
                                Write-Host "  Controller expects: $expectedType" -ForegroundColor Green
                                Write-Host "  Query/Command returns: $actualReturnType" -ForegroundColor Red
                                Write-Host "  File: $($actualFile.FullName)" -ForegroundColor Gray
                                $totalMismatches++
                            }
                        }
                    }
                }
            }
        }
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Validation Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Total Queries Scanned:       $totalQueries" -ForegroundColor Blue
Write-Host "Total Commands Scanned:      $totalCommands" -ForegroundColor Blue
Write-Host "Domain Entity Leaks Found:   $totalViolations" -ForegroundColor $(if ($totalViolations -eq 0) { "Green" } else { "Red" })
Write-Host "Controller Mismatches Found: $totalMismatches" -ForegroundColor $(if ($totalMismatches -eq 0) { "Green" } else { "Magenta" })
$totalIssues = $totalViolations + $totalMismatches
Write-Host "Total Issues:                $totalIssues" -ForegroundColor $(if ($totalIssues -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($totalIssues -eq 0) {
    Write-Host "✓ SUCCESS - All queries/commands return proper DTOs matching controller expectations!" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "✗ FAILED - Found $totalIssues contract violations" -ForegroundColor Red
    Write-Host ""
    Write-Host "VIOLATION TYPES:" -ForegroundColor White
    Write-Host "-------------------------------------------" -ForegroundColor White
    Write-Host "1. Domain Entity Leaks ($totalViolations):" -ForegroundColor White
    Write-Host "   Queries/Commands returning Domain.Entities.* types" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Controller Mismatches ($totalMismatches):" -ForegroundColor White
    Write-Host "   Controller expects DTO but Query/Command returns entity" -ForegroundColor White
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor White
    Write-Host "-------------------------------------------" -ForegroundColor White
    Write-Host "❌ BAD:  IRequest<ApiResponse<Domain.Entities.Planning.Location>>" -ForegroundColor Red
    Write-Host "✅ GOOD: IRequest<ApiResponse<LocationResponse>>" -ForegroundColor Green
    Write-Host ""
    Write-Host "❌ BAD:  PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.Object>>" -ForegroundColor Red
    Write-Host "✅ GOOD: PaginatedQuery<PaginatedApiResponse<ObjectResponse>>" -ForegroundColor Green
    Write-Host ""
    Write-Host "Please fix all violations before committing." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
