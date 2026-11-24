using System;
using ERPEZ.Application.Features.Procurement.Dashboard.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.Reports;

public record GetPRReportQuery : IRequest<PaginatedApiResponse<PRReportDto>>
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

public record GetConsolidatedPRReportQuery : IRequest<PaginatedApiResponse<ConsolidatedPRReportDto>>
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

public record GetRFQReportQuery : IRequest<PaginatedApiResponse<RFQReportDto>>
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

public record GetNOAReportQuery : IRequest<PaginatedApiResponse<NOAReportDto>>
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

public record GetNTPReportQuery : IRequest<PaginatedApiResponse<NTPReportDto>>
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

public record GetPOReportQuery : IRequest<PaginatedApiResponse<POReportDto>>
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

public record GetContractReportQuery : IRequest<PaginatedApiResponse<ContractReportDto>>
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

public record GetDirectContractingReportQuery : IRequest<PaginatedApiResponse<DirectContractingReportDto>>
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

public record GetDirectAcquisitionReportQuery : IRequest<PaginatedApiResponse<DirectAcquisitionReportDto>>
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
