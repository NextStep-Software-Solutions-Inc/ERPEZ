using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocationStats;

public record GetDUAllocationStatsQuery : IRequest<ApiResponse<DUAllocationStatsResponse>>
{
	public string? Filters { get; init; }
}
