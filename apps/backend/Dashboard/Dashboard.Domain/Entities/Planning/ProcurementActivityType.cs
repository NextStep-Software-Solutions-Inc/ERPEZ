using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
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
    public string? ActivityCode { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Description { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int? MinDays { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int? MaxDays { get; set; }

    /// <summary>
    /// Null for user-defined custom types.
    /// Set only for seeded GPPB-standard types so the system can reliably
    /// identify key schedule dates without string-name matching.
    /// </summary>
    public ProcurementActivitySystemRole? SystemRole { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsArchived { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int DisplayOrder { get; set; } = 0;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? MilestoneKey { get; set; }

    // Navigation properties
    public virtual List<APPProcurementSchedule> APPProcurementSchedules { get; set; } = [];
}
