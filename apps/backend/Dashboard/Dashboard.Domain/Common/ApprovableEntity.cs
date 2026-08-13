using Sieve.Attributes;

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
    
    [Sieve(CanFilter = true, CanSort = true)]
    public StatusEnum Status { get; set; } = StatusEnum.Draft;

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? SubmittedDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? ApprovedDate { get; set; }
}
