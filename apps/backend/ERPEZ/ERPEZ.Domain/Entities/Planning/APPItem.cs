using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

using ERPEZ.Domain.Enums;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Individual items in the Annual Procurement Plan
/// Links to PPMP items and includes procurement strategy details
/// </summary>
public class APPItem : BaseEntity
{
    public APPItem() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid APPId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PPMPItemId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementModeId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FundSourceId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string PAPCode { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsEarlyProcurementActivity { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsOutsourced { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public BidEvaluationCriteria? BidEvaluationCriteria { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public List<ProcurementStrategy>? ProcurementStrategies { get; set; }
    
    // Navigation properties
    public virtual APP APP { get; set; } = null!;
    public virtual PPMPItem PPMPItem { get; set; } = null!;
    public virtual ProcurementMode ProcurementMode { get; set; } = null!;
    public virtual FundSource FundSource { get; set; } = null!;
    public virtual Office Office { get; set; } = null!;
}
