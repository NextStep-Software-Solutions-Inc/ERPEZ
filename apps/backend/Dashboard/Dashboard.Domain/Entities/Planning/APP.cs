using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Annual Procurement Plan (APP)
/// Note: DeliveryUnitId is the PMO/End-User in the APP form
///       MOOE and CO budget fields are calculated. For each PPMP Item, backend will check its
///       linked Expense Class and sum the total costs of all items by MOOE and CO, then
///       stored in the APPItem record.
/// </summary>
public class APP : ApprovableEntity
{
    public APP() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string APPNumber { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string APPType { get; set; } = "Indicative"; // Indicative, Final, Updated
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Batch { get; set; } = "Batch 1";
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Quarter { get; set; } = "Q1";
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int? VersionNumber { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? VersionDate { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? SourceAPPId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string IsFinal { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    
    // Navigation properties
    public virtual FiscalYear? FiscalYear { get; set; }
    public virtual APP? SourceAPP { get; set; }
    public virtual List<APPItem> APPItems { get; set; } = [];
    public virtual List<APPPPMP> APPPPMPs { get; set; } = [];
    public virtual List<APPSignatory> APPSignatories { get; set; } = [];
    
    // Inherited from ApprovableEntity: 
    // public string Status { get; set; }
    // public DateTime? SubmittedDate { get; set; }
    // public DateTime? ApprovedDate { get; set; }
}
