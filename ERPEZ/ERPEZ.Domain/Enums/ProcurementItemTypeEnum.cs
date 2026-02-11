namespace ERPEZ.Domain.Enums;

/// <summary>
/// Represents the type/classification of a procurement item.
/// </summary>
public enum ProcurementItemTypeEnum
{
    /// <summary>
    /// Items that are consumed or used up in a single use or short period.
    /// </summary>
    Expendable = 1,

    /// <summary>
    /// Items with moderate lifespan that are consumed over time but not immediately.
    /// </summary>
    SemiExpandable = 2,

    /// <summary>
    /// Durable items with long lifespan used for operations.
    /// </summary>
    Equipment = 3,

    /// <summary>
    /// Personal Protective Equipment for safety and protection.
    /// </summary>
    PPE = 4
}
