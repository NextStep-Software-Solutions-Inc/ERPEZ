using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Linking table between AOB and RFQ.
/// </summary>
public class AOBRFQMapping : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid AOBId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid RFQId { get; set; }

    // Navigation properties
    public virtual AOB AOB { get; set; } = null!;
    public virtual RFQ RFQ { get; set; } = null!;
}
