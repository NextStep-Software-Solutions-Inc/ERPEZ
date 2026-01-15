using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IOPCRActivityRatingRepository : IRepository<OPCRActivityRating>
{
    Task<OPCRActivityRating?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}
