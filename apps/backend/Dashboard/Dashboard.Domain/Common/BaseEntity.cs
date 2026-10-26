namespace ERPEZ.Domain.Common;

using System.ComponentModel.DataAnnotations.Schema;
using Sieve.Attributes;

public abstract class BaseEntity : IEntity
{
    protected BaseEntity() { }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid Id { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime CreatedAt { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string CreatedBy { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? UpdatedAt { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
    [NotMapped]
    public bool AllowHardDelete { get; set; }
}
