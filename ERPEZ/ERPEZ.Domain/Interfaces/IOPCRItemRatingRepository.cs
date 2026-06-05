using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IOPCRItemRatingRepository : IRepository<OPCRItemRating>
{
    Task<List<OPCRItemRating>> GetByOPCRItemIdAsync(
        Guid opcrItemId, CancellationToken cancellationToken = default);
}