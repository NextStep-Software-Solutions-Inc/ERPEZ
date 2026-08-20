using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.Psdbm.Dtos;

public record PsdbmSyncRequestDto
{
    public PsdbmSyncMode SyncMode { get; init; } = PsdbmSyncMode.Full;
    public List<string>? Depots { get; init; }
    public string? Mode { get; init; } // "regional", "lgu", or null for all
    public int MaxConcurrency { get; init; } = 5;
    public string? ItemCodeFilter { get; init; }
}

public record PsdbmSyncResultDto
{
    public Guid SyncRunId { get; init; }
    public PsdbmSyncStatus Status { get; init; }
    public PsdbmSyncMode SyncMode { get; init; }
    public DateTime StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public int DepotsProcessed { get; init; }
    public int ItemsDiscovered { get; init; }
    public int ItemsCreated { get; init; }
    public int ItemsUpdated { get; init; }
    public int StockRecordsUpdated { get; init; }
    public int ErrorCount { get; init; }
    public List<PsdbmSyncItemErrorDto> Errors { get; init; } = [];
}

public record PsdbmSyncItemErrorDto
{
    public required string ItemCode { get; init; }
    public string? Depot { get; init; }
    public string? ErrorMessage { get; init; }
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
}

public record PsdbmSyncRunDto
{
    public Guid Id { get; init; }
    public DateTime StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public PsdbmSyncStatus Status { get; init; }
    public PsdbmSyncMode SyncMode { get; init; }
    public int DepotsProcessed { get; init; }
    public int ItemsDiscovered { get; init; }
    public int ItemsCreated { get; init; }
    public int ItemsUpdated { get; init; }
    public int StockRecordsUpdated { get; init; }
    public string? Errors { get; init; }
}
