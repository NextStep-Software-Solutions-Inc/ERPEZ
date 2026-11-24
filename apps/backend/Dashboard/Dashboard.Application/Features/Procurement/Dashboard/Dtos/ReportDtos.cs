using System;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Dtos;

public record PRReportDto
{
    public Guid Id { get; init; }
    public string PRNumber { get; init; } = string.Empty;
    public string OfficeName { get; init; } = string.Empty;
    public string Purpose { get; init; } = string.Empty;
    public string PRType { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateOnly RequestedDate { get; init; }
}

public record ConsolidatedPRReportDto
{
    public Guid Id { get; init; }
    public string CPRNumber { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public int PRsCount { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateOnly ConsolidationDate { get; init; }
}

public record RFQReportDto
{
    public Guid Id { get; init; }
    public string RFQNumber { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string ModeName { get; init; } = string.Empty;
    public DateOnly? Deadline { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public int SuppliersCount { get; init; }
}

public record NOAReportDto
{
    public Guid Id { get; init; }
    public string NOANumber { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string SupplierName { get; init; } = string.Empty;
    public decimal AwardedAmount { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateOnly NOADate { get; init; }
}

public record NTPReportDto
{
    public Guid Id { get; init; }
    public string NTPNumber { get; init; } = string.Empty;
    public string ContractNumber { get; init; } = string.Empty;
    public string SupplierName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateOnly NTPDate { get; init; }
    public DateOnly? EffectivityDate { get; init; }
    public DateOnly? DeliveryCompletionDeadline { get; init; }
}

public record POReportDto
{
    public Guid Id { get; init; }
    public string PONumber { get; init; } = string.Empty;
    public string SupplierName { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateOnly Date { get; init; }
    public string? DeliveryTerm { get; init; }
}

public record ContractReportDto
{
    public Guid Id { get; init; }
    public string ContractNumber { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string SupplierName { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateOnly ContractDate { get; init; }
    public DateOnly? ContractApprovedAt { get; init; }
}

public record DirectContractingReportDto
{
    public Guid Id { get; init; }
    public string DCNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string SupplierName { get; init; } = string.Empty;
    public decimal TotalABC { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime SubmissionDeadline { get; init; }
}

public record DirectAcquisitionReportDto
{
    public Guid Id { get; init; }
    public string DANumber { get; init; } = string.Empty;
    public string Remarks { get; init; } = string.Empty;
    public decimal TotalABC { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}
