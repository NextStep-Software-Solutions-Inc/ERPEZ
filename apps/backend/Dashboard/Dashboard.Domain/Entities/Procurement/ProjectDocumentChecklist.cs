using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Procurement;

public class ProjectDocumentChecklist : TenantScopedEntity
{
    public Guid ProcurementProjectId { get; set; }

    /// <summary>Null when this is a custom (project-specific) requirement.</summary>
    public Guid? MasterDocumentTypeId { get; set; }

    /// <summary>Populated only when MasterDocumentTypeId is null.</summary>
    public string? CustomDocumentName    { get; set; }
    public string? CustomTemplateFileUrl { get; set; }

    /// <summary>1 = Envelope 1 (Technical)  |  2 = Envelope 2 (Financial)</summary>
    public int  EnvelopeType { get; set; }
    public bool IsRequired   { get; set; } = true;
    public int  OrderIndex   { get; set; }

    public virtual ProcurementProject  ProcurementProject { get; set; } = null!;
    public virtual MasterDocumentType? MasterDocumentType { get; set; }
}