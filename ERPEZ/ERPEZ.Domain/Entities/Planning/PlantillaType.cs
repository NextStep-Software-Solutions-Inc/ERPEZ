using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents the plantilla (position authorization) type.
/// </summary>
public class PlantillaType : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Duration { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool RequiresActingAppointments { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool AllowsContractual { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Optional array of benefits associated with this plantilla type.
    /// Stored as JSON array in database.
    /// </summary>
    public string? Benefits { get; set; }

    /// <summary>
    /// Navigation property to positions of this plantilla type.
    /// </summary>
    public virtual List<Position> Positions { get; set; } = [];
}
