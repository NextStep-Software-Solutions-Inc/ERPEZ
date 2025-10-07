using ERPEZ.Domain.Common;
using Sieve.Attributes;
using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCR : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DUAllocationId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DeliveryUnitId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public int FiscalYear { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;
    public virtual OPCREvaluation OPCREvaluation { get; set; } = null!;
    public virtual DUAllocation DUAllocation { get; set; } = null!;
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public List<OPCREvaluation> OPCREvaluations { get; set; } = [];
    public List<OPCRKPI> OPCRKPIs { get; set; } = [];

}
