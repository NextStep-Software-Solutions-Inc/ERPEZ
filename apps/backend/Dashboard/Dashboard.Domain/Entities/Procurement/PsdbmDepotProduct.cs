using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a product availability and stock in a specific depot
/// </summary>
public class PsdbmDepotProduct : BaseEntity
{
    public PsdbmDepotProduct() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProductId { get; set; }
    public virtual PsdbmProduct? Product { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DepotId { get; set; }
    public virtual PsdbmDepot? Depot { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Price { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Availability { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public int AvailableStock { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int RemainingQtyForDelivery { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime LastSyncedAt { get; set; }

    // Navigation properties
    public virtual ICollection<PsdbmStockHistory> StockHistories { get; set; } = [];
}
