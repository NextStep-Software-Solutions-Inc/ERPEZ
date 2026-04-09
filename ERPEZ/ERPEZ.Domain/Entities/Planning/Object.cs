using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class Object : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? FiscalYearId { get; set; }
    public virtual FiscalYear? FiscalYear { get; set; }
    public virtual Object? ParentObject { get; set; }
    public virtual List<Object> ChildObjects { get; set; } = [];
    public virtual List<ObjectExpenseClass> ObjectExpenseClasses { get; set; } = [];
    public virtual List<WFPObjectiveActivityExpenditure> WFPObjectiveActivityExpenditures { get; set; } = [];
    public virtual List<Transaction> Transactions { get; set; } = [];
}
