using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class SubOfficeCeiling : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeCeilingId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SubOfficeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FundClusterId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal PSAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal MOOEAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal COAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;

    public virtual OfficeCeiling OfficeCeiling { get; set; } = null!;
    public virtual Office SubOffice { get; set; } = null!;
    public virtual FundSource FundCluster { get; set; } = null!;
    public virtual FiscalYear FiscalYear { get; set; } = null!;
}