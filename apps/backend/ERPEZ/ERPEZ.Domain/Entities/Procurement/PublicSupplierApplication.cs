using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a public supplier's bid application submission
/// for a specific procurement project.
/// </summary>
public class PublicSupplierApplication : BaseEntity
{
    public Guid ProcurementProjectId { get; set; }
    public string CompanyName     { get; set; } = string.Empty;
    public string ContactPerson   { get; set; } = string.Empty;
    public string EmailAddress    { get; set; } = string.Empty;
    public string ContactNumber   { get; set; } = string.Empty;
    public string TinNumber       { get; set; } = string.Empty;
    public string BusinessAddress { get; set; } = string.Empty;

    /// <summary>Submitted | UnderEvaluation | Disqualified | Responsive</summary>
    public string   Status      { get; set; } = "Submitted";
    public DateTime SubmittedAt { get; set; }

    // Navigation properties
    public virtual ProcurementProject                ProcurementProject { get; set; } = null!;
    public virtual List<ApplicationUploadedDocument> UploadedDocuments  { get; set; } = [];
}