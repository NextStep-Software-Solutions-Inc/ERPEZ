using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRConsolidation : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    public virtual FiscalYear FiscalYear { get; set; } = null!;
    public virtual List<OPCR> OPCRs { get; set; } = [];
}