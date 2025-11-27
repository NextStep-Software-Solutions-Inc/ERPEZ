using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRKPI : BaseEntity
{
    public Guid DUKPIAssignmentId { get; set; }
    public Guid OPCRId { get; set; }
    public virtual OPCR OPCR { get; set; } = null!;
    public virtual DUKPIAssignment DUKPIAssignment { get; set; } = null!;
    public virtual List<OPCRActivity> OPCRActivities { get; set; } = [];
    public virtual List<OPCRRating> OPCRRatings { get; set; } = [];
}
