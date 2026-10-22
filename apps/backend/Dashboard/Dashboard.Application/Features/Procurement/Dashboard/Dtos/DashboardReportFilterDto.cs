using System;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Dtos;

public record DashboardReportFilterDto
{
    public int FiscalYear { get; init; }
    public Guid? OfficeId { get; init; }
    public int? Quarter { get; init; }
    public string? ProcurementMode { get; init; }
    public DateOnly? DateFrom { get; init; }
    public DateOnly? DateTo { get; init; }
    public string? Status { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; } = false;
}
