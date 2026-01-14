using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Other;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

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
    
    // Navigation properties
    public virtual List<PPMPItem> PPMPItems { get; set; } = [];
    public virtual List<APPItem> APPItems { get; set; } = [];
}
