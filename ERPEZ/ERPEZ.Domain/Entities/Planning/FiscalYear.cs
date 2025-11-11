using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class FiscalYear : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public int Year { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    public bool IsLocked { get; set; } = false;
    // Navigation property for function allocations
    public List<FunctionAllocation> FunctionAllocations { get; set; } = [];
}
