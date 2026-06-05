using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRItemMOV : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OPCRItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string RequirementName { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? AttachedUrl { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? UploadedDate { get; set; }

    // Navigation properties
    public virtual OPCRItem OPCRItem { get; set; } = null!;
}