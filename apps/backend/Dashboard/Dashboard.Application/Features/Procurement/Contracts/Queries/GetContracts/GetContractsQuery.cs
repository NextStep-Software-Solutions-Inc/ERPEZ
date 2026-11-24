using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContracts;

public record GetContractsQuery : IRequest<PaginatedApiResponse<ContractListDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public string? Status { get; init; }
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
}
