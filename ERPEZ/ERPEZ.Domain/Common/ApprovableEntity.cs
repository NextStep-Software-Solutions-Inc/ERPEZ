namespace ERPEZ.Domain.Common;

using ERPEZ.Domain.Enums;

/// <summary>
/// Base class for entities that require approval workflow. 
/// Inherits from BaseEntity and implements IApprovable. 
/// Used by: LineItemBudget, PPMP, APP
/// </summary>
public abstract class ApprovableEntity : BaseEntity, IApprovable
{
    protected ApprovableEntity() { }
    
    public StatusEnum Status { get; set; } = StatusEnum.Draft;
    public DateTime? SubmittedDate { get; set; }
    public DateTime? ApprovedDate { get; set; }
}
