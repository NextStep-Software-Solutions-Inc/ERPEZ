using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class Agency : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Address { get; set; } = string.Empty;
    
    /// <summary>PNG or JPEG logo, max 512 KB. Null = use default embedded logo.</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public byte[]? LogoImage { get; set; }
}