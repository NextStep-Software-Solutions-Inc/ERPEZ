using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAPRs;

public record GetAPRsQuery : IRequest<PaginatedApiResponse<APRListItemDto>>
{
    public int     PageNumber { get; init; } = 1;
    public int     PageSize   { get; init; } = 25;
    public string? Filters    { get; init; }
    public string? Sorts      { get; init; }
}
