using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Record of a PSDBM synchronization job run
/// </summary>
public class PsdbmSyncRun : BaseEntity
{
    public PsdbmSyncRun() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime StartedAt { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? CompletedAt { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public PsdbmSyncStatus Status { get; set; } = PsdbmSyncStatus.Running;

    [Sieve(CanFilter = true, CanSort = true)]
    public PsdbmSyncMode SyncMode { get; set; } = PsdbmSyncMode.Full;

    [Sieve(CanFilter = true, CanSort = true)]
    public int DepotsProcessed { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int ItemsDiscovered { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int ItemsCreated { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int ItemsUpdated { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int StockRecordsUpdated { get; set; }

    public string? Errors { get; set; }

    // Navigation properties
    public virtual ICollection<PsdbmStockHistory> StockHistories { get; set; } = [];
}
