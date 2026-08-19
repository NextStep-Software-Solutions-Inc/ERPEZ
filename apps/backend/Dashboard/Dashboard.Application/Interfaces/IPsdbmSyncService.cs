using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Interfaces;

public interface IPsdbmSyncService
{
    Task<PsdbmSyncResultDto> SyncAsync(
        PsdbmSyncRequestDto request,
        CancellationToken cancellationToken = default);

    Task<PsdbmSyncResultDto> SyncDepotAsync(
        string depotName,
        string mode = "regional",
        PsdbmSyncMode syncMode = PsdbmSyncMode.Full,
        CancellationToken cancellationToken = default);

    Task<PsdbmSyncRunDto?> GetSyncRunAsync(
        Guid syncRunId,
        CancellationToken cancellationToken = default);

    Task<List<PsdbmSyncRunDto>> GetSyncRunsAsync(
        int count = 20,
        CancellationToken cancellationToken = default);
}
