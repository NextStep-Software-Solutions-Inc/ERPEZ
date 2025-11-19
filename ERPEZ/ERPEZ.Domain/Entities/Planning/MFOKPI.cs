using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class MFOKPI : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid MFOPAPId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIId { get; set; }
    public virtual MFOPAP MFOPAP { get; set; } = null!;
    public virtual KPI KPI { get; set; } = null!;
}
