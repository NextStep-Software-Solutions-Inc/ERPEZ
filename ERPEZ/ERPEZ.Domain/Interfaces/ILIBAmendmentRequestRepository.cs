using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface ILIBAmendmentRequestRepository : IRepository<LIBAmendmentRequest>
{
	Task<LIBAmendmentRequest?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
	Task<List<LIBAmendmentRequest>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
}