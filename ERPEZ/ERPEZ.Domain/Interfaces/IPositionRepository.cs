using ERPEZ.Domain.Entities.Planning;

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
}
