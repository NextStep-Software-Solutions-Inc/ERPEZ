using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Audit trail of stock and price snapshots over time
/// </summary>
public class PsdbmStockHistory : BaseEntity
{
    public PsdbmStockHistory() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DepotProductId { get; set; }
    public virtual PsdbmDepotProduct? DepotProduct { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int AvailableStock { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int RemainingQtyForDelivery { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Price { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Availability { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime CapturedAt { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? SyncRunId { get; set; }
    public virtual PsdbmSyncRun? SyncRun { get; set; }
}
