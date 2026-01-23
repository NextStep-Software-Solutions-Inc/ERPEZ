using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

/// <summary>
/// Repository interface for managing Object child code operations.
/// </summary>
public interface IObjectChildCodeRepository : IRepository<ObjectChildCode>
{
    /// <summary>
    /// Gets all children of a parent object.
    /// </summary>
    /// <param name="parentObjectId">The parent object ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of child object codes.</returns>
    Task<List<ObjectChildCode>> GetChildrenAsync(Guid parentObjectId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the full hierarchy tree starting from a parent object.
    /// </summary>
    /// <param name="parentObjectId">The parent object ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of all descendants.</returns>
    Task<List<ObjectChildCode>> GetDescendantsAsync(Guid parentObjectId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all ancestors (parent chain) of a child object.
    /// </summary>
    /// <param name="childObjectId">The child object ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of all ancestors.</returns>
    Task<List<ObjectChildCode>> GetAncestorsAsync(Guid childObjectId, CancellationToken cancellationToken = default);
}
