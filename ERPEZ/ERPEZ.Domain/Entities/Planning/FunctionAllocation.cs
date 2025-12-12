using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class FunctionAllocation : BaseEntity
{

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }
    public FiscalYear FiscalYear { get; set; } = null!;
    public FunctionTypeEnum FunctionType { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Percentage { get; set; }
}
