using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Dtos;

public record ProcurementContractRiskDto
{
    public decimal TotalValueAtRisk30Days { get; init; }
    public decimal TotalValueAtRisk60Days { get; init; }
    public decimal TotalValueAtRisk90Days { get; init; }
    public List<ExpiringContractDto> ExpiringContracts { get; init; } = [];
}

public record ExpiringContractDto
{
    public Guid Id { get; init; }
    public string ContractNumber { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string SupplierName { get; init; } = string.Empty;
    public DateOnly? EndDate { get; init; }
    public decimal TotalAmount { get; init; }
    public string Status { get; init; } = string.Empty;
    public int DaysUntilExpiry { get; init; }
}
