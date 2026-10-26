using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Procurement;
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

    /// <summary>
    /// GPPB-mandated minimum number of suppliers that must be canvassed/invited
    /// under this procurement mode (e.g. Shopping/SVP typically require >= 3).
    /// Enforced on RFQ Submit, not on RFQ Create (drafts may be incomplete).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public int MinSupplierCount { get; set; } = 1;
        
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
    public virtual List<RFQ> RFQs { get; set; } = [];
    public virtual List<ProcurementProject> ProcurementProjects { get; set; } = [];
}
