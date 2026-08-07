using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a position within an office/organizational unit.
/// </summary>
public class Position : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Title { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? FunctionalTitle { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? ItemNumber { get; set; }

    public string? JobDescription { get; set; }

    public string? Qualifications { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? FTE { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string OperationalStatus { get; set; } = nameof(PositionStatusEnum.Vacant);

    // Foreign Keys
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PositionTypeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PlantillaTypeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SalaryGradeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid StepId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }

    // Navigation Properties
    public virtual PositionType PositionType { get; set; } = null!;
    public virtual PlantillaType PlantillaType { get; set; } = null!;
    public virtual SalaryGrade SalaryGrade { get; set; } = null!;
    public virtual Step Step { get; set; } = null!;
    public virtual Office Office { get; set; } = null!;
}
