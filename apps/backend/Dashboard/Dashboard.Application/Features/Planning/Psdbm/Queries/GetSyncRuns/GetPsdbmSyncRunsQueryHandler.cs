using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetSyncRuns;

public class GetPsdbmSyncRunsQueryHandler(
    IPsdbmSyncService syncService,
    ILogger<GetPsdbmSyncRunsQueryHandler> logger)
    : IRequestHandler<GetPsdbmSyncRunsQuery, ApiResponse<List<PsdbmSyncRunDto>>>,
      IRequestHandler<GetPsdbmSyncRunByIdQuery, ApiResponse<PsdbmSyncRunDto>>
{
    public async Task<ApiResponse<List<PsdbmSyncRunDto>>> Handle(
        GetPsdbmSyncRunsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var runs = await syncService.GetSyncRunsAsync(request.Count, cancellationToken);
            return ApiResponse<List<PsdbmSyncRunDto>>.Success(runs, "Sync runs retrieved successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve PSDBM sync runs");
            return ApiResponse<List<PsdbmSyncRunDto>>.Fail($"Failed to retrieve sync runs: {ex.Message}");
        }
    }

    public async Task<ApiResponse<PsdbmSyncRunDto>> Handle(
        GetPsdbmSyncRunByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var run = await syncService.GetSyncRunAsync(request.Id, cancellationToken);
            if (run == null)
            {
                return ApiResponse<PsdbmSyncRunDto>.Fail("Sync run not found.");
            }

            return ApiResponse<PsdbmSyncRunDto>.Success(run, "Sync run retrieved successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve PSDBM sync run {SyncRunId}", request.Id);
            return ApiResponse<PsdbmSyncRunDto>.Fail($"Failed to retrieve sync run: {ex.Message}");
        }
    }
}
