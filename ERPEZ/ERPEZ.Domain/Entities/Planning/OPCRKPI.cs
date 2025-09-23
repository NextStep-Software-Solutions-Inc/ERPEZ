using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRKPI : BaseEntity
{
    public Guid KPIId { get; set; }
    public Guid OPCRId { get; set; }
    public virtual OPCRActivity OPCRActivity { get; set; } = null!;
    public virtual OPCRRating OPCRRating { get; set; } = null!;
}
