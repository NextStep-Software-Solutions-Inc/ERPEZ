using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IPersonnelPositionRepository : IRepository<PersonnelPosition>
{
    /// <summary>
    /// Gets all active personnel positions for a specific user.
    /// </summary>
    Task<List<PersonnelPosition>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all personnel positions for a specific position.
    /// </summary>
    Task<List<PersonnelPosition>> GetByPositionIdAsync(Guid positionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a user has an active assignment.
    /// </summary>
    Task<bool> HasActiveAssignmentAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a user has an active assignment to a specific position.
    /// </summary>
    Task<bool> HasActiveAssignmentAsync(Guid userId, Guid positionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a position has any active assignment.
    /// </summary>
    Task<bool> HasAnyActiveAssignmentForPositionAsync(Guid positionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a personnel position by ID with User, Position, and Office navigation properties included.
    /// </summary>
    Task<PersonnelPosition?> GetByIdWithIncludesAsync(Guid id, CancellationToken cancellationToken = default);
}
