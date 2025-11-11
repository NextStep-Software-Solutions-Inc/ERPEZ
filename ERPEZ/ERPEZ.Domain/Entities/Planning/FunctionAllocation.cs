using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class FunctionAllocation : BaseEntity
{
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int FiscalYearId { get; set; }
    public FiscalYear FiscalYear { get; set; } = null!;
    
    public string FunctionType { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Percentage { get; set; }
}
