using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Procurement Mode master list
/// Values include: 
/// - Competitive Bidding
/// - Limited Source Bidding
/// - Competitive Dialogue
/// - Unsolicited Offer with Bid Matching
/// - Direct Contracting
/// - Direct Acquisition
/// - Repeat Order
/// - Small Value Procurement
/// - Negotiated Procurement
/// - Direct Sales
/// - Direct Procurement for Science, Technology, and Innovation
/// - Shopping
/// </summary>
public class ProcurementMode : BaseEntity
{
    public ProcurementMode() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal MinThreshold { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? MaxThreshold { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsArchived { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    // Foreign Keys
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ProcurementCategoryId { get; set; }
    
    // Navigation properties
    public virtual ProcurementCategory? ProcurementCategory { get; set; }
    public virtual List<ProcurementModeThreshold> ProcurementModeThresholds { get; set; } = [];
    public virtual List<PPMPItem> PPMPItems { get; set; } = [];
    public virtual List<APPItem> APPItems { get; set; } = [];
}
