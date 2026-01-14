using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Other;

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
    public Guid ProcurementModelId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DeliveryUnitId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FundSourceId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string PAPCode { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsEarlyProcurementActivity { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsOutsourced { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public List<string>? BidEvaluationCriteria { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? ProcurementStrategy { get; set; }
}
