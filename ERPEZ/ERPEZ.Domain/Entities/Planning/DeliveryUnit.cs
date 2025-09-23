using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class DeliveryUnit : BaseEntity
{
    public Guid OfficeId { get; set; }
    public Guid? ParentDUId { get; set; }
    public virtual KPIAssignment KPIAssignment { get; set; } = null!;
    public virtual OPCR OPCR { get; set; } = null!;
}
