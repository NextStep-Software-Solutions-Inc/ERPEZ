using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class Organization : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Type { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? FiscalYearId { get; set; }
    public virtual FiscalYear? FiscalYear { get; set; }
    public virtual Organization? ParentOrganization { get; set; }
    public virtual List<Organization> Organizations { get; set; } = [];
    public virtual List<Transaction> Transactions { get; set; } = [];
    public virtual List<Office> Offices { get; set; } = [];
    public virtual List<OrganizationFundSource> OrganizationFundSources { get; set; } = [];
}
