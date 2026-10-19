using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Individual procurement items in PPMP (Line Items)
/// Note: IsNonCSE is a flag used to identify non-CSE manual entry items.  
///       If Non-CSE there is no CSEItemId, CSEItem navigation is null
///       The procurement project name and code in an APP item should be copied directly 
///       from the corresponding PPMP item.
/// </summary>
public class PPMPItem : TenantScopedEntity
{
    public PPMPItem() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PPMPExpenditureItemId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? CSEItemId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? NonCSEItemId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementModeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool? PreProcurementConference { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? ProcurementStartDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? ProcurementEndDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? ExpectedDeliveryStart { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? ExpectedDeliveryEnd { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? PAPCode { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Unit { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal UnitPrice { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int PlannedQuantity { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool MOPOverride { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? MOPJustification { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public ProcurementProjectType ProjectType { get; set; } = ProcurementProjectType.Goods;
    
    // Navigation properties
    public virtual PPMPExpenditureItem PPMPExpenditureItem { get; set; } = null!;
    
    [System.ComponentModel.DataAnnotations.Schema.ForeignKey(nameof(CSEItemId))]
    public virtual ProcurementItem? CSEItem { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.ForeignKey(nameof(NonCSEItemId))]
    public virtual NonCSEItem? NonCSEItem { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.ForeignKey(nameof(ProcurementModeId))]
    public virtual ProcurementMode ProcurementMode { get; set; } = null!;
    public virtual List<PPMPItemAllocation> PPMPItemAllocations { get; set; } = [];
    public virtual List<APPItem> APPItems { get; set; } = [];
    public virtual List<APPProcurementSchedule> APPProcurementSchedules { get; set; } = [];
}
