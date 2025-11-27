using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRActivity : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OPCRId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DUKPIAssignmentId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Budget { get; set; }
    public virtual OPCR OPCR { get; set; } = null!;
    public virtual DUKPIAssignment DUKPIAssignment { get; set; } = null!;
    public virtual List<DeliveryUnit> DeliveryUnits { get; set; } = [];
    public virtual List<OPCRPAPDepartment> OPCRPAPDepartments { get; set; } = [];
}
