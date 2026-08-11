using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

public class DocumentProfile : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    /// <summary>e.g. "Goods" | "Infrastructure" | "Consulting" | "SVP"</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string ProcurementCategory { get; set; } = string.Empty;

    public virtual List<DocumentProfileItem> DocumentProfileItems { get; set; } = [];
}