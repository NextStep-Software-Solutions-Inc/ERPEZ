using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a snapshot of a WHEREAS clause selected for a specific BAC resolution.
/// </summary>
public class BACResolutionClause : BaseEntity
{
    public Guid BACResolutionId { get; set; }
    public Guid? TemplateClauseId { get; set; }
    public string ClauseText { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsCustom { get; set; }

    // Navigation properties
    public virtual BACResolution BACResolution { get; set; } = null!;
    public virtual BACResolutionWhereasClause? TemplateClause { get; set; }
}
