using ERPEZ.Application.Interfaces;
using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetDepots;

public class GetPsdbmDepotsQueryHandler(IPhilGepsService philGepsService)
    : IRequestHandler<GetPsdbmDepotsQuery, ApiResponse<List<PsdbmDepotDto>>>
{
    public async Task<ApiResponse<List<PsdbmDepotDto>>> Handle(
        GetPsdbmDepotsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var depots = await philGepsService.GetDepotsAsync(cancellationToken);

            return ApiResponse<List<PsdbmDepotDto>>.Success(
                depots, "Depots fetched successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<List<PsdbmDepotDto>>.Fail(
                $"Failed to communicate with PhilGEPS: {ex.Message}");
        }
    }
}