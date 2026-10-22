using System;
using ERPEZ.Application.Features.Procurement.Dashboard.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetContractRisk;

public record GetContractRiskQuery : IRequest<ApiResponse<ProcurementContractRiskDto>>
{
    public int FiscalYear { get; init; }
    public Guid? OfficeId { get; init; }
    public int? Quarter { get; init; }
    public string? ProcurementMode { get; init; }
    public DateOnly? DateFrom { get; init; }
    public DateOnly? DateTo { get; init; }
    public string? Status { get; init; }
}
