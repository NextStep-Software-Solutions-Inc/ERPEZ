using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IGeneralRatingScaleRepository : IRepository<GeneralRatingScale>
{
    /// <summary>
    /// Get general rating scale by ID with FiscalYear navigation property included.
    /// </summary>
    Task<GeneralRatingScale?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default);
}
