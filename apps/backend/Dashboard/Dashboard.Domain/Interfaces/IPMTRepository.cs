using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IPMTRepository : IRepository<PMT>
{
    /// <summary>
    /// Gets the PMT for a specific organization and year.
    /// </summary>
    Task<PMT?> GetByOrganizationAndYearAsync(Guid organizationId, int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a PMT exists for a specific organization and year.
    /// </summary>
    Task<bool> ExistsForOrganizationAndYearAsync(Guid organizationId, int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a PMT by ID with Organization, PMTMembers, and Employee navigation properties included.
    /// </summary>
    Task<PMT?> GetByIdWithIncludesAsync(Guid id, CancellationToken cancellationToken = default);
}
