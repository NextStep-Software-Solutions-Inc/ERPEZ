using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Procurement schedule/timeline for APP items
/// Links to specific procurement activity types
/// </summary>
public class APPProcurementSchedule : BaseEntity
{
    public APPProcurementSchedule() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PPMPItemId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementActivityTypeId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? ScheduledDate { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? CustomDateText { get; set; }
    
    // Navigation properties
    public virtual PPMPItem PPMPItem { get; set; } = null!;
    public virtual ProcurementActivityType ProcurementActivityType { get; set; } = null!;
}
