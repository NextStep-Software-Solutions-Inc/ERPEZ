using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class MFOPAP : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Type { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? FiscalYearId { get; set; }
    public virtual FiscalYear? FiscalYear { get; set; }
    public virtual MFOPAP? ParentMFOPAP { get; set; }
    public virtual List<MFOPAP> MFOPAPs { get; set; } = [];
    public virtual List<Transaction> Transactions { get; set; } = [];
    public virtual List<KPI> KPIs { get; set; } = [];
}
