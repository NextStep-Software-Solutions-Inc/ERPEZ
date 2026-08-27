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
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? StartOfProcurementOverride { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? EndOfProcurementOverride { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? EstimatedBudgetOverride { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? EPARemarks { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsNew { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsRevised { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal OriginalPPMPBudget
    {
        get
        {
            if (PPMPItem == null) return 0;

            // Resolve effective unit price from PPMPItem, NonCSEItem, or CSEItem.ItemPrices
            decimal resolvedUnitPrice = PPMPItem.UnitPrice;
            if (resolvedUnitPrice <= 0 && PPMPItem.NonCSEItem != null && PPMPItem.NonCSEItem.CurrentPrice > 0)
            {
                resolvedUnitPrice = PPMPItem.NonCSEItem.CurrentPrice;
            }
            if (resolvedUnitPrice <= 0 && PPMPItem.CSEItem != null && PPMPItem.CSEItem.ItemPrices != null)
            {
                var priceObj = PPMPItem.CSEItem.ItemPrices.FirstOrDefault(p => !p.IsDeleted && p.UnitPrice > 0);
                if (priceObj != null)
                {
                    resolvedUnitPrice = priceObj.UnitPrice;
                }
            }

            var allocSum = PPMPItem.PPMPItemAllocations != null && PPMPItem.PPMPItemAllocations.Any(a => !a.IsDeleted)
                ? PPMPItem.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Amount > 0 ? a.Amount : a.Quantity * resolvedUnitPrice)
                : 0;

            if (allocSum > 0) return allocSum;

            if (PPMPItem.PlannedQuantity > 0 && resolvedUnitPrice > 0)
            {
                return PPMPItem.PlannedQuantity * resolvedUnitPrice;
            }

            return resolvedUnitPrice;
        }
    }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal EffectiveABC => (EstimatedBudgetOverride.HasValue && EstimatedBudgetOverride.Value > 0)
        ? EstimatedBudgetOverride.Value
        : OriginalPPMPBudget;
    
    // Navigation properties
    public virtual APP APP { get; set; } = null!;
    public virtual PPMPItem PPMPItem { get; set; } = null!;
    public virtual ProcurementMode ProcurementMode { get; set; } = null!;
    public virtual FundSource FundSource { get; set; } = null!;
    public virtual Office Office { get; set; } = null!;
}
