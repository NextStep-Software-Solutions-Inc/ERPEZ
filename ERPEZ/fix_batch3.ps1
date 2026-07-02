# Fix all BATCH 3 issues
$files = Get-ChildItem -Path "ERPEZ.Application\Features\Planning" -Recurse -Filter "*.cs" | 
    Where-Object { $_.FullName -match "(FunctionConfig|ProcurementPolicyConfig|GeneralRatingScale|EconomicIndicator|WorkflowMatrix)" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix FiscalYear.Name → FiscalYear.Year
    $content = $content -replace 'x\.FiscalYear\?\.Name', 'x.FiscalYear?.Year.ToString()'
    $content = $content -replace 'entity\.FiscalYear\?\.Name', 'entity.FiscalYear?.Year.ToString()'
    $content = $content -replace 'FiscalYearName \{ get; init; \} = string\.Empty', 'FiscalYearYear { get; init; }'
    
    # Fix FunctionConfig property names
    $content = $content -replace 'StrategicFunctionMinWeight', 'StrategicMinWeight'
    $content = $content -replace 'StrategicFunctionMaxWeight', 'StrategicMaxWeight'
    $content = $content -replace 'SupportFunctionMinWeight', 'SupportMinWeight'
    $content = $content -replace 'SupportFunctionMaxWeight', 'SupportMaxWeight'
    
    # Fix UpdateAsync/DeleteAsync to Update/Remove
    $content = $content -replace 'await unitOfWork\.(FunctionConfigRepository|ProcurementPolicyConfigRepository|GeneralRatingScaleRepository|EconomicIndicatorRepository|WorkflowMatrixRepository)\.UpdateAsync\(entity, cancellationToken\);', 'unitOfWork.$1.Update(entity);'
    $content = $content -replace 'await unitOfWork\.(FunctionConfigRepository|ProcurementPolicyConfigRepository|GeneralRatingScaleRepository|EconomicIndicatorRepository|WorkflowMatrixRepository)\.DeleteAsync\(entity, cancellationToken\);', 'unitOfWork.$1.Remove(entity);'
    
    # Fix PaginatedApiResponse.Success → new PaginatedApiResponse
    $content = $content -replace 'return PaginatedApiResponse<List<(\w+)Response>>\.Success\(response, totalCount, filteredCount\);', 'return new PaginatedApiResponse<List<$1Response>>(response, 1, response.Count, filteredCount);'
    
    Set-Content $file.FullName -Value $content -NoNewline
}

Write-Host "Fixed all files"
