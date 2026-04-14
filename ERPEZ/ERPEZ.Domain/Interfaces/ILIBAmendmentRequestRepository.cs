using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface ILIBAmendmentRequestRepository : IRepository<LIBAmendmentRequest>
{
	Task<LIBAmendmentRequest?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
	Task<(IEnumerable<LIBAmendmentRequest>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
	Task<List<LIBAmendmentRequest>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
}