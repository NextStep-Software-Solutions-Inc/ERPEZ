using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetDepots;

public record GetPsdbmDepotsQuery : IRequest<ApiResponse<List<PsdbmDepotDto>>>
{
    public string? Mode { get; init; } // "regional", "lgu", or null for all
}