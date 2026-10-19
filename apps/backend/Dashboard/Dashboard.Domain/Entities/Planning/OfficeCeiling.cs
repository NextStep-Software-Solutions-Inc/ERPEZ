using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OfficeCeiling : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string TargetType { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid AgencyMasterBudgetId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal PSAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal MOOEAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal COAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsSupplemental { get; set; }

    public virtual FiscalYear FiscalYear { get; set; } = null!;
    public virtual Office Office { get; set; } = null!;
    public virtual AgencyMasterBudget AgencyMasterBudget { get; set; } = null!;
    public virtual List<SubOfficeCeiling> SubOfficeCeilings { get; set; } = [];
}