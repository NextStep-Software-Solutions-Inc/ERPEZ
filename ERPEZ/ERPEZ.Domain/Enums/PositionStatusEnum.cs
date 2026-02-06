namespace ERPEZ.Domain.Enums;

/// <summary>
/// Represents the operational status of a position.
/// </summary>
public enum PositionStatusEnum
{
    /// <summary>
    /// Position is currently occupied by an employee.
    /// </summary>
    Filled = 1,

    /// <summary>
    /// Position is currently empty and available for hiring.
    /// </summary>
    Vacant = 2,

    /// <summary>
    /// Position is temporarily suspended from being filled.
    /// </summary>
    Frozen = 3
}
