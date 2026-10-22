using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class LIBAmendmentRequest : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid LineItemBudgetId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProposedLineItemBudgetId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Reason { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Justification { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }

    public virtual LineItemBudget LineItemBudget { get; set; } = null!;
    public virtual LineItemBudget ProposedLineItemBudget { get; set; } = null!;
}