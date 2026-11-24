using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Planning.Psdbm.Commands.TriggerSync;

public class TriggerPsdbmSyncCommandHandler(
    IPsdbmSyncService syncService,
    ILogger<TriggerPsdbmSyncCommandHandler> logger)
    : IRequestHandler<TriggerPsdbmSyncCommand, ApiResponse<PsdbmSyncResultDto>>
{
    public async Task<ApiResponse<PsdbmSyncResultDto>> Handle(
        TriggerPsdbmSyncCommand command, CancellationToken cancellationToken)
    {
        try
        {
            logger.LogInformation("Triggering PSDBM synchronization via API request");
            var result = await syncService.SyncAsync(command.Request, cancellationToken);

            return ApiResponse<PsdbmSyncResultDto>.Success(
                result, $"PSDBM synchronization finished with status {result.Status}");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "PSDBM synchronization trigger failed");
            return ApiResponse<PsdbmSyncResultDto>.Fail($"Sync failed: {ex.Message}");
        }
    }
}
