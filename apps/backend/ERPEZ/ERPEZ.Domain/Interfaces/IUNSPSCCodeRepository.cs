using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IUNSPSCCodeRepository : IRepository<UNSPSCCode>
{
    /// <summary>
    /// Check if UNSPSC Code is in use by any active procurement items.
    /// </summary>
    Task<bool> IsInUseAsync(Guid unspscCodeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get UNSPSC Code by ID with Parent navigation property included.
    /// </summary>
    Task<UNSPSCCode?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get children of UNSPSC Code by parent ID.
    /// </summary>
    Task<List<UNSPSCCode>> GetChildrenAsync(Guid parentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if UNSPSC Code has children.
    /// </summary>
    Task<bool> HasChildrenAsync(Guid unspscCodeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all UNSPSC codes with parent names for flat list display.
    /// </summary>
    Task<(IReadOnlyList<UNSPSCCodeWithParentName> Entities, int TotalCount)> GetAllWithParentNamesAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
}

public class UNSPSCCodeWithParentName
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Level { get; set; }
    public bool IsActive { get; set; }
    public Guid? ParentId { get; set; }
    public string? ParentName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
