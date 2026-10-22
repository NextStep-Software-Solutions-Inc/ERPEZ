using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a single document file uploaded as part of
/// a public supplier's bid application.
/// Mirrors the pattern used by SupplierRequirement.Url.
/// BlobStorageUrl is the permanent URL returned by PromoteFileAsync.
/// </summary>
public class ApplicationUploadedDocument : TenantScopedEntity
{
    public Guid ApplicationId   { get; set; }

    /// <summary>
    /// FK to ProjectDocumentChecklist — ties this file
    /// to the exact checklist requirement it satisfies.
    /// </summary>
    public Guid ChecklistItemId { get; set; }

    /// <summary>Permanent blob URL after PromoteFileAsync.</summary>
    public string   BlobStorageUrl   { get; set; } = string.Empty;
    public string   OriginalFileName { get; set; } = string.Empty;
    public DateTime UploadedAt       { get; set; }

    // Navigation properties
    public virtual PublicSupplierApplication Application  { get; set; } = null!;
    public virtual ProjectDocumentChecklist  ChecklistItem { get; set; } = null!;
}