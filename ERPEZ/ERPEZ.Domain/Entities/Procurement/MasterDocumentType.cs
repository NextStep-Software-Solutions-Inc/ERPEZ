using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

public class MasterDocumentType : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    /// <summary>1 = Envelope 1 (Technical/Eligibility)  |  2 = Envelope 2 (Financial)</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public int EnvelopeType { get; set; }

    /// <summary>Permanent URL returned by PromoteFileAsync.</summary>
    public string? TemplateFileUrl { get; set; }

    public virtual List<DocumentProfileItem>      DocumentProfileItems      { get; set; } = [];
    public virtual List<ProjectDocumentChecklist> ProjectDocumentChecklists { get; set; } = [];
}