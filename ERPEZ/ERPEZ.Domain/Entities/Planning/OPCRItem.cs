using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRItem : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OPCRId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIAssignmentId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Q1Target { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Q2Target { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Q3Target { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Q4Target { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsShopped { get; set; }

    /// <summary>
    /// Actual accomplishment value — string to support both numeric and descriptive entries.
    /// ERD: string/decimal?
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string? ActualAccomplishment { get; set; }

    /// <summary>
    /// Justification for variance between target and actual accomplishment.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Justification { get; set; }

    public virtual OPCR OPCR { get; set; } = null!;
    public virtual KPIAssignment KPIAssignment { get; set; } = null!;
    public virtual List<OPCRActivity> OPCRActivities { get; set; } = [];
    public virtual List<OPCRItemRating> OPCRItemRatings { get; set; } = [];
    public virtual List<OPCRItemMOV> OPCRItemMOVs { get; set; } = [];
}
