using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRPAPDepartment : BaseEntity
{
    public Guid OPCRActivityId { get; set; }
    public Guid OfficeId { get; set; }

    public virtual OPCRActivity OPCRActivity { get; set; } = null!;
    public virtual Office Office { get; set; } = null!;
}
