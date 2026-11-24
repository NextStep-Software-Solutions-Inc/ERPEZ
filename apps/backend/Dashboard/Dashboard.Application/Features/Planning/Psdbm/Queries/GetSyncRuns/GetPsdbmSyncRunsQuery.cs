using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetSyncRuns;

public record GetPsdbmSyncRunsQuery : IRequest<ApiResponse<List<PsdbmSyncRunDto>>>
{
    public int Count { get; init; } = 20;
}

public record GetPsdbmSyncRunByIdQuery : IRequest<ApiResponse<PsdbmSyncRunDto>>
{
    public Guid Id { get; init; }
}
