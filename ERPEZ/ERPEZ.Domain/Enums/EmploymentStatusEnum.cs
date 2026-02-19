namespace ERPEZ.Domain.Enums;

/// <summary>
/// Defines the employment status of a user/employee.
/// </summary>
public enum EmploymentStatusEnum
{
    /// <summary>
    /// Regular permanent employee.
    /// </summary>
    Regular = 1,

    /// <summary>
    /// Probationary employee.
    /// </summary>
    Probationary = 2,

    /// <summary>
    /// Contractual/Job Order employee.
    /// </summary>
    Contractual = 3,

    /// <summary>
    /// Casual employee.
    /// </summary>
    Casual = 4,

    /// <summary>
    /// Inactive/Separated employee.
    /// </summary>
    Inactive = 5
}
