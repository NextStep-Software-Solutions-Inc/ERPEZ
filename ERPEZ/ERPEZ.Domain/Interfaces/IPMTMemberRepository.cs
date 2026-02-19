using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IPMTMemberRepository : IRepository<PMTMember>
{
    /// <summary>
    /// Gets all members of a specific PMT.
    /// </summary>
    Task<List<PMTMember>> GetByPMTIdAsync(Guid pmtId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a user is already a member of a specific PMT.
    /// </summary>
    Task<bool> IsUserInPMTAsync(Guid pmtId, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active PMT memberships for a user.
    /// </summary>
    Task<List<PMTMember>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a PMT member by ID with User, PMT, and Organization navigation properties included.
    /// </summary>
    Task<PMTMember?> GetByIdWithIncludesAsync(Guid id, CancellationToken cancellationToken = default);
}
