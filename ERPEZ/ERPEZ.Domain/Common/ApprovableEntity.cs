namespace ERPEZ.Domain.Common;

/// <summary>
/// Base class for entities that require approval workflow. 
/// Inherits from BaseEntity and implements IApprovable. 
/// Used by: LineItemBudget, PPMP, APP
/// </summary>
public abstract class ApprovableEntity : BaseEntity, IApprovable
{
    protected ApprovableEntity() { }
    
    public string Status { get; set; } = string.Empty;
    public DateTime? SubmittedDate { get; set; }
    public DateTime? ApprovedDate { get; set; }
}
