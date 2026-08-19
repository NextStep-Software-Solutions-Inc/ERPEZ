using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetDepots;

public class GetPsdbmDepotsQueryHandler(
    IPsdbmQueryService queryService,
    ILogger<GetPsdbmDepotsQueryHandler> logger)
    : IRequestHandler<GetPsdbmDepotsQuery, ApiResponse<List<PsdbmDepotDto>>>
{
    public async Task<ApiResponse<List<PsdbmDepotDto>>> Handle(
        GetPsdbmDepotsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var depots = await queryService.GetDepotsAsync(cancellationToken);
            return ApiResponse<List<PsdbmDepotDto>>.Success(depots, "Depots fetched successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve PSDBM depots");
            return ApiResponse<List<PsdbmDepotDto>>.Fail($"Failed to retrieve depots: {ex.Message}");
        }
    }
}