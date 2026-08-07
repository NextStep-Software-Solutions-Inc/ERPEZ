using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    /// <summary>
    /// Gets a user by username.
    /// </summary>
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a user by email.
    /// </summary>
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a user by employee number.
    /// </summary>
    Task<User?> GetByEmployeeNumberAsync(string employeeNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a username already exists.
    /// </summary>
    Task<bool> UsernameExistsAsync(string username, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if an email already exists.
    /// </summary>
    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if an employee number already exists.
    /// </summary>
    Task<bool> EmployeeNumberExistsAsync(string employeeNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active users.
    /// </summary>
    Task<List<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all users by office ID.
    /// </summary>
    Task<List<User>> GetByOfficeIdAsync(Guid officeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a user by ID with Office navigation property included.
    /// </summary>
    Task<User?> GetByIdWithOfficeAsync(Guid id, CancellationToken cancellationToken = default);
}
