using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents SPMS weight boundaries for Strategic, Core Function, and Support functions per Fiscal Year.
/// </summary>
public class FunctionConfig : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal StrategicMinWeight { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? StrategicMaxWeight { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal CoreFunctionMinWeight { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? CoreFunctionMaxWeight { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal SupportMinWeight { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? SupportMaxWeight { get; set; }

    // Navigation Properties
    public virtual FiscalYear? FiscalYear { get; set; }
}
