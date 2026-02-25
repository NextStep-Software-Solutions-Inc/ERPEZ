using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IPositionRepository : IRepository<Position>
{
    /// <summary>
    /// Gets the count of positions by operational status.
    /// </summary>
    Task<int> CountByStatusAsync(string status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of all positions.
    /// </summary>
    Task<int> CountAllAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Gets a paged collection of positions with related details, using the specified Sieve model
    /// for filtering, sorting, and pagination.
    /// </summary>
    /// <param name="sieveModel">The Sieve model that defines filtering, sorting, and pagination options.</param>
    /// <param name="cancellationToken">The cancellation token to observe while waiting for the task to complete.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains a tuple where the first
    /// value is the collection of positions with details that match the specified criteria, and the second
    /// value is the total number of matching positions before pagination is applied.
    /// </returns>
    Task<(IEnumerable<Position>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Gets a position by ID with all related entities.
    /// </summary>
    Task<Position?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}
