using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Types of procurement activities for scheduling
/// Sample values:
/// - Advertisement/Posting of IB/REI
/// - Submission/Opening of Bids
/// - Notice of Award
/// - Contract Signing
/// </summary>
public class ProcurementActivityType : BaseEntity
{
    public ProcurementActivityType() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Description { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int? MinDays { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int? MaxDays { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsArchived { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual List<APPProcurementSchedule> APPProcurementSchedules { get; set; } = [];
}
