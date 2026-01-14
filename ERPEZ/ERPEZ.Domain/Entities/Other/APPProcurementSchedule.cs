using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Procurement;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Other;

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
    public DateTime ScheduledDate { get; set; }
    
    // Navigation properties
    public virtual PPMPItem PPMPItem { get; set; } = null!;
    public virtual ProcurementActivityType ProcurementActivityType { get; set; } = null!;
}
