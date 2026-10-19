using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Join table between DocumentProfile and MasterDocumentType.
/// OrderIndex drives drag-and-drop sort order in both the Admin UI
/// and the resulting supplier portal upload slots.
/// </summary>
public class DocumentProfileItem : TenantScopedEntity
{
    public Guid DocumentProfileId    { get; set; }
    public Guid MasterDocumentTypeId { get; set; }
    public int  OrderIndex           { get; set; }

    public virtual DocumentProfile    DocumentProfile    { get; set; } = null!;
    public virtual MasterDocumentType MasterDocumentType { get; set; } = null!;
}