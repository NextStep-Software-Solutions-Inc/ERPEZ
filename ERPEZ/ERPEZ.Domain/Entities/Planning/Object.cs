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
    public List<ActivityBudgetRequirement> ActivityBudgetRequirements { get; set; } = [];
    public List<Transaction> Transactions { get; set; } = [];
}
