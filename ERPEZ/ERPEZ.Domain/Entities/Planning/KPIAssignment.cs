using ERPEZ.Domain.Common;
using Sieve.Attributes;
using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIAssignment : BaseEntity
{

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DeliveryUnitId { get; set; }
    [JsonIgnore]
    public virtual KPI KPI { get; set; } = null!;
    [JsonIgnore]
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
}
