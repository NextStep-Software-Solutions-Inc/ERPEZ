using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class AgencyMasterBudget : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FundSourceId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string SourceDocumentType { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal PSAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal MOOEAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal COAmount { get; set; }

    public virtual FiscalYear FiscalYear { get; set; } = null!;
    public virtual FundSource FundSource { get; set; } = null!;
    public virtual List<OfficeCeiling> OfficeCeilings { get; set; } = [];
}