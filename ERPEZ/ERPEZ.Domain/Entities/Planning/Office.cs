using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class Office : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ClusterId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string OfficeHead {  get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set;} = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Address {  get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Email {  get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string ContactNumber {  get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string? ResponsibilityCenterCode {  get; set; }
    public virtual Cluster Cluster { get; set; } = null!;
    public virtual List<DeliveryUnit> DeliveryUnits { get; set; } = [];
}
