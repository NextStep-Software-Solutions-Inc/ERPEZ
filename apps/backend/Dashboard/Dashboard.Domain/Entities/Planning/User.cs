using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a user/employee in the system.
/// Serves as both authentication account and employee/personnel record.
/// </summary>
public class User : TenantScopedEntity
{
    /// <summary>
    /// Keycloak subject identifier (sub claim) representing the federated external identity.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string? ExternalIdentityId { get; set; }

    /// <summary>
    /// Employee number or personnel ID.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string EmployeeNumber { get; set; } = string.Empty;

    /// <summary>
    /// Username for authentication.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Email address.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// First name.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Middle name.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string? MiddleName { get; set; }

    /// <summary>
    /// Last name.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Name extension (e.g., Jr., Sr., III).
    /// </summary>
    public string? NameExtension { get; set; }

    /// <summary>
    /// Contact phone number.
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Employment status.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string EmploymentStatus { get; set; } = nameof(EmploymentStatusEnum.Regular);

    /// <summary>
    /// Date of employment/hiring.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? DateHired { get; set; }

    /// <summary>
    /// Date of separation (if applicable).
    /// </summary>
    public DateTime? DateSeparated { get; set; }

    /// <summary>
    /// Indicates if the user account is active.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Foreign key to the Office/Department.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? OfficeId { get; set; }

    // Navigation Properties
    /// <summary>
    /// The office/department this user belongs to.
    /// </summary>
    public virtual Office? Office { get; set; }

    /// <summary>
    /// Personnel positions assigned to this user.
    /// </summary>
    public virtual List<PersonnelPosition> PersonnelPositions { get; set; } = [];

    /// <summary>
    /// AMS Operational role assignments.
    /// </summary>
    public virtual ICollection<ERPEZ.Domain.Entities.AMS.UserRoleAssignment> RoleAssignments { get; set; } = [];

    /// <summary>
    /// Gets the full name of the user.
    /// </summary>
    public string FullName =>
        $"{FirstName} {(string.IsNullOrEmpty(MiddleName) ? "" : MiddleName + " ")}{LastName}{(string.IsNullOrEmpty(NameExtension) ? "" : " " + NameExtension)}".Trim();
}
